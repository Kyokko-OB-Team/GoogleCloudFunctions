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
exports.getNewDocument = functions.https.onRequest((req, res) => {
//  const collenctionName = req.body["collection"];
  const collectionRef = fireStore.collection("sensor-data_test-env");
  collectionRef.orderBy("time").limit(1).get().then((snap) => {
    const temp = snap.doc().get("temperature");
    const humi = snap.doc().get("humidity");
    const co2 = snap.doc().get("co2-concentration");
    const unixtime = snap.doc().get("time");

    // 時間変換
    let date = new Date(unixtime * 1000);

    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept");
    let strOut = "\n";
    strOut += "sensor-data_test-env\n";
    strOut += "最新データ\n";
    strOut += "時間:";
    strOut += date.toLocaleDateString("ja-JP");
    strOut += date.toLocaleTimeString("ja-JP") + "\n";
    strOut += "温度:" + "\n";
    strOut += "湿度:" + "\n";
    strOut += "CO2濃度:" + "\n";
    res.status(200).send(strOut);
  })
      .catch((error) => {
        res.send(error());
      });
});

// Batch フィールドに時間の情報を追加
exports.setTimeData = functions.https.onRequest(async (req, res) => {
  const collectionName = req.body["collection"];

  const db = admin.firestore();
  let batch = db.batch();
  const snapshots = await db.collection(collectionName)
      .get();
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
