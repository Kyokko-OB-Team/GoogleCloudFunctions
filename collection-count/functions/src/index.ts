import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
// export const helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

// firebaseの初期化
admin.initializeApp(functions.config().firebase);

const fireStore = admin.firestore();

// collectionsのdocuments数カウント
exports.countCollections = functions.https.onRequest((req, res) => {
  const collectionName = req.body["collection"];
  const collectionsRef = fireStore.collection(collectionName);
  collectionsRef.get().then((snap) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-HEaders",
        "Origin, X-Requested-With, Content-Type, Accept");
    let strOut = "\n";
    strOut += collectionName + "\n";
    strOut += "lenght: " + snap.size + "\n";
    res.status(200).send(strOut);
  })
      .catch((error) => {
        res.send(error());
      });
});

