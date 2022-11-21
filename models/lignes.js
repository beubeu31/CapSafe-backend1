const mongoose = require("mongoose");
const lignesSchema = mongoose.Schema([{
    gare: String,
    ligne: String,
    correspondance: [{
      lignes: String,
     }],
}]);

const Ligne = mongoose.model("lignes", lignesSchema);

module.exports = Ligne;
