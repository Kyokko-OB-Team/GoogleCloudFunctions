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
  let collectionName = "";
  let eolCode = "";
  if (req.method === "POST") {
    collectionName = req.body["collection"];
    eolCode = "\n";
  }
  if (req.method === "GET") {
    if (req.query.collection !== undefined) {
      collectionName = req.query.collection.toString();
    }
    eolCode = "<br>";
  }
  const collectionsRef = fireStore.collection(collectionName);
  collectionsRef.get().then((snap) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept");
    let strOut = eolCode;
    strOut += collectionName + eolCode;
    strOut += "lenght: " + snap.size + eolCode;
    res.status(200).send(strOut);
  })
      .catch((error) => {
        res.send(error());
      });
});

// Documentの一番新しいデータを取得
exports.getLatestDocument = functions.https.onRequest(async (req, res) => {
  let collenctionName = "";
  if (req.method === "POST") {
    collenctionName = req.body["collection"];
  } else if (req.method === "GET") {
    if (req.query.collection !== undefined) {
      collenctionName = req.query.collection.toString();
    } else {
      res.status(400).end();
    }
  }

  const db = admin.firestore();
  const collectionRef = db.collection(collenctionName);
  const snapshot = await collectionRef.orderBy("time", "desc").limit(1).get();
  const temp = snapshot.docs[0].get("temperature");
  const humi = snapshot.docs[0].get("humidity");
  const co2 = snapshot.docs[0].get("co2-concentration");
  const unixtime = snapshot.docs[0].get("time");

  // 時間変換
  const date = new Date(unixtime * 1000);
  date.setHours(date.getHours() + 9);

  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept");
  res.type("application/json");

  res.json(
      {
        name: collenctionName,
        time: date.toLocaleString("ja-JP"),
        temperature: temp.toFixed(2),
        humidity: humi.toFixed(2),
        co2Concentration: co2,
      }
  );
  res.status(200).send();
});

// Batch フィールドに時間の情報を追加
exports.setTimeData = functions.https.onRequest(async (req, res) => {
  const collectionName = req.body["collection"];

  const db = admin.firestore();
  let batch = db.batch();
  const snapshots = await db.collection(collectionName).get();
  let log = "";
  res.send("function exec.\n");

  snapshots.docs.map((doc, index) => {
    if (doc.get("time") === undefined) {
      if ((index + 1) % 100 === 0) {
        batch.commit(); // 100件毎にコミット
        batch = db.batch(); // 新しいインスタンス
        console.log(log);
        log = "";
      }
      // update
      batch.set(doc.ref, {time: Number(doc.id)}, {merge: true});
      log += "index: " + index + ", docID: " + doc.id + "\n";
    }
  });
  batch.commit();
});
