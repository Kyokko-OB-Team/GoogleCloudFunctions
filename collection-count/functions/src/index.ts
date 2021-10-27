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
      eolCode = "<br>";
    }
  }
  const collectionsRef = fireStore.collection(collectionName);
  collectionsRef.get().then((snap) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-HEaders",
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
//  const collenctionName = req.body["collection"];
  let eolCode = "";
  if (req.method === "POST") {
    eolCode = "\n";
  }
  if (req.method === "GET") {
    eolCode = "<br>";
  }

  const db = admin.firestore();
  const collectionRef = db.collection("sensor-data_test-env");
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
  let strOut = eolCode;
  strOut += "sensor-data_test-env" + eolCode;
  strOut += "最新データ" + eolCode;
  strOut += "時間: ";
  strOut += date.toLocaleString("ja-JP") + eolCode;
  strOut += "温度: " + temp.toFixed(2) + eolCode;
  strOut += "湿度: " + humi.toFixed(2) + eolCode;
  strOut += "CO2濃度: " + co2 + eolCode;
  res.status(200).send(strOut);
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
