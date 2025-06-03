const request = require("supertest");
const app = require("./app");
const Event = require("./models/events");

// TDD de Steven pour tester la route POST /users/signup
it("it should create a user", async () => {
  const res = await request(app).post("/users/signup").send({
    username: "StevenTDD",
    email: "steven@gmail.com",
    password: "12345",
    birthdate: "1995-08-22",
    telephone: "0622134658",
  });

  expect(res.statusCode).toBe(200);
  expect(res.body.result).toBe(true);

  expect(res.body.savedUser).toMatchObject({
    username: "StevenTDD",
    email: "steven@gmail.com",
    telephone: "0622134658",
  });
});

//  TDD de Steven pour tester la route POST /users/signup si les champs sont vides
it("it should return an error", async () => {
  const res = await request(app).post("/users/signup").send({
    username: "",
    email: "",
    password: "12345",
    birthdate: "1995-08-22",
    telephone: "0622134658",
  });

  expect(res.statusCode).toBe(200);
  expect(res.body.result).toBe(false);
  expect(res.body.error).toBe("Missing or empty fields");

  // TDD Andy pour tester l'ajout d'un event
  it("POST /events", async () => {
    newEvent = {
      title: "test creation event",
      description: "description event",
      location: {
        type: "Point",
        coordinates: [-1.28333, 47.083328],
        address: "30 rue des lilas Clisson",
      },
      date: "2025-07-12T20:00:00.000+00:00",
      type: "Musique",
      participants: 250,
      price: 300,
      image: "image.jpg",
    };
    const res = await request(app).post("/events").send(newEvent);
    expect(res.statusCode).toBe(201);
    expect(res.body.result).toBe(true);
  });
  // TDD de Steven pour tester la route POST /users/signup
  //it("POST /users/signup", async () => {
  //  const res = await request(app).post("/users/signup").send({
  //    username: "StevenTDD",
  //    email: "steven@gmail.com",
  //    password: "12345",
  //    birthdate: "1995-08-22",
  //    telephone: "0622134658",
  //  });
  //
  //  expect(res.statusCode).toBe(200);
  //  expect(res.body.result).toBe(true);
  //});
  // TDD Andy pour tester l'ajout d'un event
  it("POST /events", async () => {
    newEvent = {
      title: "test creation event",
      description: "description event",
      location: {
        type: "Point",
        coordinates: [-1.28333, 47.083328],
        address: "30 rue des lilas Clisson",
      },
      date: "2025-07-12T20:00:00.000+00:00",
      type: "Musique",
      participants: 250,
      price: 300,
      image: "image.jpg",
    };
    const res = await request(app).post("/events").send(newEvent);
    expect(res.statusCode).toBe(201);
    expect(res.body.result).toBe(true);
  });

  // TDD de Fleurines pour tester la route POST /users/signin

  // Import pour le test
  const request = require("supertest"); // Permet de simuler des requêtes HTTP
  const bcrypt = require("bcrypt"); // Pour chiffrer les mots de passe comme dans l'app réelle

  // Import Express et  Users.js
  const app = require("../app");
  const User = require("../models/users");

  // Simulation du comportement de Mongoose avec jest
  jest.mock("../models/users");

  // ✅ Test 1 : L'utilisateur peut se connecter avec un bon email et un bon mot de passe
  it("Connexion OK avec bon email et bon mot de passe", async () => {
    // On crée un mot de passe chiffré
    const hashedPassword = await bcrypt.hash("azerty123", 10);

    // On simule un utilisateur dans la base de données
    User.findOne.mockResolvedValue({
      email: "titanesque@gmail.com",
      password: hashedPassword,
      token: "testtoken123",
      username: "Titan le tyran",
    });

    // Envoie de la requête de connexion
    const res = await request(app).post("/users/signin").send({
      email: "titanesque@gmail.com",
      password: "Ilovemymum123",
    });

    // Vérification que la réponse est correcte
    expect(res.statusCode).toBe(200);
    expect(res.body.result).toBe(true);
  });

  expect(res.body.token).toBe("testtoken123");
  expect(res.body.username).toBe("Titan le tyran");
});

//  TDD de Damien pour tester la route GET /events/

// describe permet de regrouper plusieurs tests autour d’un même sujet : ici, la route GET /events.

describe("GET /events", () => {
  beforeEach(async () => {
    await Event.deleteMany(); // Avant chaque test, on vide la collection d’événements pour repartir d’une base propre. Ça évite que des données persistantes faussent les résultats.
  });

  // Cas 1 : Ce test simule un cas où un événement existe déjà dans la base de données.

  it("should return events if they exist", async () => {
    // On crée un événement dans la base pour préparer le test.
    await Event.create({
      title: "Get Test Event",
      description: "Event à récupérer",
      location: {
        type: "Point",
        coordinates: [2.3333, 48.8666],
        address: "Paris",
      },
      date: new Date(),
      type: "Concert",
      participants: 50,
      price: 20,
      image: "https://example.com/get.jpg",
    });

    const response = await request(app).get("/events");

    expect(response.statusCode).toBe(200);
    // On vérifie que le champ result est true.
    expect(response.body.result).toBe(true);
    // On vérifie que la liste des événements contient au moins un élément.
    expect(response.body.events.length).toBeGreaterThan(0);
    // On vérifie que l’événement retourné est bien celui qu’on a créé.
    expect(response.body.events[0].title).toBe("Get Test Event");
  });

  // Cas 2 : Ce test simule un cas où aucun événement n’existe dans la base (puisqu’on l’a vidée juste avant avec beforeEach).

  it("should return a message if no events are found", async () => {
    const response = await request(app).get("/events");

    expect(response.statusCode).toBe(200);
    expect(response.body.result).toBe(false);
    expect(response.body.message).toBe("No events found");
  });
});

// ❌ Test 2 : Connexion échouée si l'email n'est pas au bon format
it("Connexion échouée avec email invalide", async () => {
  const res = await request(app).post("/users/signin").send({
    email: "pas-un-email",
    password: "Ilovemymum123",
  });

  expect(res.body.result).toBe(false);
  expect(res.body.error).toBe("Invalid email format");
});

// ❌ Test 3 : Connexion échouée si les champs sont vides
it("Connexion échouée avec champs manquants", async () => {
  const res = await request(app).post("/users/signin").send({
    email: "",
    password: "",
  });

  expect(res.body.result).toBe(false);
  expect(res.body.error).toBe("Missing or empty fields");
});

// ❌ Test 4 : Connexion échouée si le mot de passe est incorrect
it("Connexion échouée avec mauvais mot de passe", async () => {
  const hashedPassword = await bcrypt.hash("azerty123", 10);

  // On simule un utilisateur avec un mot de passe valide
  User.findOne.mockResolvedValue({
    email: "titanesque@gmail.com",
    password: hashedPassword,
    token: "testtoken123",
    username: "Titan le tyran",
  });

  // Mais on envoie un mauvais mot de passe dans la requête
  const res = await request(app).post("/users/signin").send({
    email: "titanesque@gmail.com",
    password: "Ilovemycroquette",
  });

  expect(res.body.result).toBe(false);
  expect(res.body.error).toBe("Invalid email or password");
});

// ❌ Test 5 : Connexion échouée si l'utilisateur n'existe pas
it("Connexion échouée si utilisateur non trouvé", async () => {
  // On simule l'absence d'utilisateur dans la base
  User.findOne.mockResolvedValue(null);

  const res = await request(app).post("/users/signin").send({
    email: "inconnuaubataillon@gmail.com",
    password: "Napoleon",
  });

  expect(res.body.result).toBe(false);
  expect(res.body.error).toBe("Invalid email or password");
});
