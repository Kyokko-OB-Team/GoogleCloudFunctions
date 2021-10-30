# 使い方

## API一覧

- [countCollections](#countCollections)
- [getLatestDocument](#getLatestDocument)
- [setTimeData](#setTimeData)
<br>


## countCollections

FireStoreに登録されている要素数をカウントします。<br>
パラメータは`collection`のみで、値はコレクション名を指定してください。<br>
<br>

### GETの場合

パラメータを指定してAPIを叩いてください。<br>
以下はブラウザでAPIを叩く場合の例です。<br>

https://us-central1-kyokko-ob-team-8a210.cloudfunctions.net/countCollections?collection=sensor-data_test-env
<br>
<br>

### POSTの場合

HTTPリクエストのbodyにパラメータを指定して叩いてください。<br>
以下はcurlコマンドでAPIを叩く場合の例です。<br>

```
$ curl https://us-central1-kyokko-ob-team-8a210.cloudfunctions.net/countCollections -d 'collection=sensor-data_test-env'
```
<br>
<br>

## getLatestDocument

FireStoreに登録されている要素のうち1番最新の要素を取得します。<br>
現在は取得するコレクションは`sensor-data_test-env`で固定になっています。<br>
そのうちパラメータ指定で取得できるようにする予定です。<br>
<br>

### GETの場合

そのままAPIを叩いてください。<br>
以下はブラウザでAPIを叩く場合の例です。<br>

https://us-central1-kyokko-ob-team-8a210.cloudfunctions.net/getLatestDocument
<br>
<br>

### POSTの場合

以下はcurlコマンドでAPIを叩く場合の例です。<br>

```
curl -X POST https://us-central1-kyokko-ob-team-8a210.cloudfunctions.net/getLatestDocument
```

## setTimeData

このAPIは過去のドキュメントに一括でデータを追加したい場合のみ使用してください。<br>
現在はFireStoreに登録されている要素のドキュメントにもunixtimeデータを追加します。<br>
パラメータは`collection`のみで、値はコレクション名を指定してください。<br>
<br>

### GETの場合

非対応です。<br>
<br>

### POSTの場合

HTTPリクエストのbodyにパラメータを指定して叩いてください。<br>
以下はcurlコマンドでAPIを叩く場合の例です。<br>

```
$ curl https://us-central1-kyokko-ob-team-8a210.cloudfunctions.net/setTimeData -d 'collection=sensor-data_test-env'
```
<br>
<br>

