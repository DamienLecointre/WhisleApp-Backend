var express = require("express");
var router = express.Router();
const Event = require("../models/events"); // Import du model Event
const { checkBody } = require("../modules/checkBody"); // Import du module checkBody (fonction qui sert à valider qu'un body de requête contient bien les champs requis)
const opencage = require("opencage-api-client");
const API_KEY = process.env.OPENCAGE_API_KEY;

// Route get qui récupère tous les events
router.get("/", (req, res) => {
  Event.find().then((allEvents) => {
    // Vérifie qu'il y a au moins un évènement dans la BD
    if (allEvents.length > 0) {
      res.json({
        result: true,
        message: "events found",
        events: allEvents,
      });
    } else {
      res.json({
        result: false,
        message: "No events found",
      });
    }
  });
});

// Route delete qui permet de supprimer un event
router.delete("/:eventTitle", (req, res) => {
  Event.deleteOne({
    title: { $regex: new RegExp(req.params.eventTitle, "i") },
  }).then((deleteDoc) => {
    // Vérifie qu'il y a un élément avec le nom renseigné
    if (deleteDoc.deletedCount > 0) {
      Event.find().then((data) => {
        res.json({ result: true, eventName: data });
      });
    } else {
      res.json({ result: false, error: "Event not found" });
    }
  });
});

router.post("/", async (req, res) => {
  try {
    const {
      title,
      description,
      location,
      date,
      type,
      participants,
      price,
      image,
    } = req.body;

    // Requête vers OpenCage pour obtenir les coordonnées
    const geoData = await opencage.geocode({ q: location, key: API_KEY });

    if (geoData.status.code !== 200 || geoData.results.length === 0) {
      return res.status(400).json({ error: "Adresse introuvable" });
    }

    const { lat, lng } = geoData.results[0].geometry;

    // Création de l'événement avec le format GeoJSON
    const newEvent = new Event({
      title,
      description,
      location: {
        type: "Point",
        coordinates: [lng, lat],
        address: location,
      },
      date,
      type,
      participants,
      price,
      image,
    });

    await newEvent.save();
    res.status(201).json({ newEvent, result: true });
  } catch (error) {
    console.error("Erreur lors de la création de l'événement:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

router.post("/handle", async (req, res) => {
  try {
    const {
      title,
      description,
      location, // ici, location = { latitude, longitude, address }
      date,
      type,
      participants,
      price,
      image,
    } = req.body;

    const newEvent = new Event({
      title,
      description,
      location: {
        type: "Point",
        coordinates: [location.longitude, location.latitude],
      },
      date,
      type,
      participants,
      price,
      image,
    });

    await newEvent.save();
    res.status(201).json({ newEvent, result: true });
    res.json({
      result: true,
      message: `newEvent créer dans la BD: ${newEvent}`,
    });
    console.log("newEvent créer dans la BD:", newEvent);
  } catch (error) {
    console.error("Erreur lors de la création de l'événement:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// Route pour l'ajout d'une participation
router.put("/events/:id", async (req, res) => {
  try {
    const eventId = req.params.id;

    // On récupère l'événement
    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({ message: "Événement non trouvé" });
    }

    // On incrémente le nombre de participants
    event.participants += 1;

    // On sauvegarde la modification
    await event.save();

    res.json(event);
  } catch (error) {
    console.error("Erreur PUT /events/:id :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

module.exports = router;
