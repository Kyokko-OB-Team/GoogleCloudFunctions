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

// Documentの一番新しいデータを取得
//exports.getNewDocument = functions.https.onRequest((req, res) => {
//  const collenctionName = req.body["collection"];
//  const collectionRef = fireStore.collection(collenctionName);
//
//});

// Batch フィールドに時間の情報を追加
exports.setTimeData = functions.https.onRequest(async (req, res) => {
  const collectionName = req.body["collection"];
  res.send('exec setTimeData function.');

  const db = admin.firestore();
  let batch = db.batch();
  const snapshots = await db.collection(collectionName).get();

  snapshots.docs.map((doc, index) => {
//    if ((index + 1) % 500 === 0) {
//      batch.commit(); //500件毎にコミット
//      batch = db.batch(); //新しいインスタンス
//    }
    // update
    batch.update(doc.ref, {time: doc.id});
  });
  batch.commit();
});
