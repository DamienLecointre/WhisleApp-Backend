function checkBody(body, keys) {
  return keys.every((key) => {
    const value = body[key];

    // Si la clé est absente
    if (value === undefined || value === null) return false;

    // Si c'est une string, elle ne doit pas être vide
    if (typeof value === "string" && value.trim() === "") return false;

    // Tout le reste est accepté (tableaux, objets, nombres même 0)
    return true;
  });
}

module.exports = { checkBody };

// function checkBody(body, keys) {
//   let isValid = true;

//   for (const field of keys) {
//     if (!body[field] || body[field] === "") {
//       isValid = false;
//     }
//   }

//   return isValid;
// }

// module.exports = { checkBody };
