const express = require("express");
const router = express.Router();
const User = require("../models/users");
const { checkBody } = require("../modules/checkBody");
const bcrypt = require("bcrypt");
const uid2 = require("uid2");
const uniqid = require("uniqid");
const cloudinary = require("cloudinary").v2;
const fs = require("fs").promises;
const validator = require("validator");

// ====================== SIGNUP ======================
/*
  Route POST /users/signup
  Permet à un nouvel utilisateur de créer un compte.
  Vérifie que tous les champs sont remplis, que l'utilisateur n'existe pas déjà,
  puis enregistre le nouvel utilisateur avec un mot de passe hashé et un token unique.
*/
router.post("/signup", async (req, res) => {
  if (
    !checkBody(req.body, [
      "username",
      "password",
      "birthdate",
      "email",
      "telephone",
    ])
  ) {
    return res.json({ result: false, error: "Missing or empty fields" });
  }

  const existingUser = await User.findOne({
    username: { $regex: new RegExp(req.body.username, "i") },
  });

  if (existingUser) {
    return res.json({ result: false, error: "User already exists" });
  }

  const hash = bcrypt.hashSync(req.body.password, 10);

  const newUser = new User({
    username: req.body.username,
    birthdate: new Date(req.body.birthdate),
    password: hash,
    email: req.body.email,
    telephone: req.body.telephone,
    photo: req.body.photo,
    token: uid2(32), // token utilisé pour l'authentification
    followers: [],
    following: [],
    favorites: [],
    userRatings: [],
  });

  const savedUser = await newUser.save();
  res.json({ result: true, savedUser });
});

// ====================== SIGNIN ======================
/*
  Route POST /users/signin
  Permet à un utilisateur existant de se connecter avec son email et son mot de passe.
  Retourne le token si la connexion est réussie.
*/
router.post("/signin", async (req, res) => {
  if (!checkBody(req.body, ["email", "password"])) {
    return res.json({ result: false, error: "Missing or empty fields" });
  }

  if (!validator.isEmail(req.body.email)) {
    return res.json({ result: false, error: "Invalid email format" });
  }

  const user = await User.findOne({ email: req.body.email.toLowerCase() });
  if (!user || !(await bcrypt.compare(req.body.password, user.password))) {
    return res.json({ result: false, error: "Invalid email or password" });
  }

  res
    .status(200)
    .json({ result: true, token: user.token, username: user.username });
});

// ====================== UPDATE PROFILE PICTURE ======================
/*
  Route PUT /users/:username/updatePicture
  Permet à un utilisateur de mettre à jour sa photo de profil.
  Nécessite l'envoi d'un fichier via un champ `photoFromFront`.
  Utilise Cloudinary pour héberger l'image.
*/
router.put("/:username/updatePicture", async (req, res) => {
  try {
    const user = await User.findOne({
      username: { $regex: new RegExp(req.params.username, "i") },
    });

    if (!user) {
      return res.json({ result: false, error: "User not found" });
    }

    const photoFile = req.files?.photoFromFront;
    if (!photoFile) {
      return res.json({ result: false, error: "No file uploaded" });
    }

    const photoPath = `./tmp/${uniqid()}.jpg`;
    await photoFile.mv(photoPath); // Sauvegarde temporaire du fichier

    const resultCloudinary = await cloudinary.uploader.upload(photoPath); // Upload vers Cloudinary
    await fs.unlink(photoPath); // Suppression du fichier local temporaire

    await User.updateOne(
      { username: req.params.username },
      { photo: resultCloudinary.secure_url }
    );

    res.json({ result: true, url: resultCloudinary.secure_url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ result: false, error: "Server error" });
  }
});

// ====================== DELETE ACCOUNT ======================
/*
  Route DELETE /users/:username/delete
  Permet à un utilisateur de supprimer définitivement son propre compte.
  Authentification via le token (envoyé dans le header "Authorization").
*/
router.delete("/:username/delete", async (req, res) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return res.status(403).json({ result: false, error: "No token provided" });
  }

  try {
    const user = await User.findOne({ token });

    if (!user) {
      return res.status(403).json({ result: false, error: "Invalid token" });
    }

    if (user.username !== req.params.username) {
      return res
        .status(403)
        .json({ result: false, error: "You can only delete your own account" });
    }

    await User.findByIdAndDelete(user._id);
    res
      .status(200)
      .json({ result: true, message: "Account deleted successfully" });
  } catch (error) {
    console.error("Delete error:", error);
    res
      .status(500)
      .json({ result: false, error: "Server error, deletion failed" });
  }
});

// ====================== GET ALL USERS ======================
/*
  Route GET /users/
  Récupère tous les utilisateurs enregistrés dans la base de données.
  Utile pour le debug ou l'administration.
*/
router.get("/", async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    console.error("Erreur lors de la récupération des utilisateurs :", error);
    res.status(500).json({ result: false, error: "Erreur serveur" });
  }
});

// Route pour la modification de username
// =======================================================================

router.put("/rename/:token", (req, res) => {
  User.updateOne(
    { token: req.params.token },
    { $set: { username: req.body.username } }
  )
    .then((result) => {
      if (result.modifiedCount === 0) {
        return res
          .status(404)
          .json({ message: "Utilisateur non trouvé ou nom déjà à jour." });
      }
      res.json({ message: "Nom d'utilisateur mis à jour avec succès." });
    })
    .catch((err) => {
      res.status(500).json({ message: "Erreur serveur", error: err });
    });
});
module.exports = router;
