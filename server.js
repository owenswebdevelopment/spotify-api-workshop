import express from "express";
import fetch from "node-fetch";

const app = express();

app.set("views", "./views");
app.set("view engine", "pug");

app.use(express.static("public"));

const redirect_uri = "http://127.0.0.1:3000/callback";
const client_id = "ff9c92108ced4f36bdf1856258801591";
const client_secret = "b7dfa46bf2fb4ccf8f4f860d6c0baed4";

global.access_token;

app.get("/", function (req, res) {
  res.render("index");
});

app.get("/authorize", (req, res) => {
  var auth_query_parameters = new URLSearchParams({
    response_type: "code",
    client_id: client_id,
    scope: "user-library-read",
    redirect_uri: redirect_uri,
  });

  res.redirect(
    "https://accounts.spotify.com/authorize?" + auth_query_parameters.toString()
  );
});

app.get("/callback", async (req, res) => {
  const code = req.query.code;
  // console.log(code);
  const body = new URLSearchParams({
    code: code,
    redirect_uri: redirect_uri,
    grant_type: "authorization_code"
  });
  console.log("redirect_uri:", redirect_uri);

  const response =  await fetch("https://accounts.spotify.com/api/token", {
    method: "post",
    body: body,
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
      Authorization:
        "Basic " +
        Buffer.from(client_id + ':' + client_secret).toString('base64'),
  }
})
    const data = await response.json();
    global.access_token = data.access_token;
    console.log(data);
    res.redirect("/dashboard");
  });


async function getData(endpoint) {
  const response = await fetch("https://api.spotify.com/v1" + endpoint, {
    method: "get",
    headers: {
      Authorization: "Bearer " + global.access_token
    }
  });
  const data =  await response.json();
  return data
}
  app.get("/dashboard", async (req, res) => {
    const userInfo = await getData("/me");
    const tracks = await getData("/me/tracks?limt=10");


    console.log("userInfo:", userInfo);
    console.log("tracks:", tracks);

    let firstName = "user"
    if(userInfo.display_name){
    firstName = userInfo.display_name.split(" ")[0] || display_name || "user";
  }

  res.render("dashboard", {
  user: userInfo,       // this keeps user.display_name, user.images, etc.
  tracks: tracks.items, // this passes the user's saved tracks
  firstName: firstName
});

});


// async function getData(endpoint) {
//   const response = await fetch("https://api.spotify.com/v1" + endpoint, {
//     method: "get",
//     headers: {
//       Authorization: "Bearer " + global.access_token,
//     },
//   });

//   const data = await response.json();
//   return data;
// }

// app.get("/dashboard", async (req, res) => {
//   const userInfo = await getData("/me");
//   const tracks = await getData("/me/tracks?limit=10");

//   res.render("dashboard", { user: userInfo, tracks: tracks.items });
// });

// app.get("/recommendations", async (req, res) => {
//   const artist_id = req.query.artist;
//   const track_id = req.query.track;

//   const params = new URLSearchParams({
//     seed_artist: artist_id,
//     seed_genres: "rock",
//     seed_tracks: track_id,
//   });

//   const data = await getData("/recommendations?" + params);
//   res.render("recommendation", { tracks: data.tracks });
// });

let listener = app.listen(3000, function () {
  console.log(
    "Your app is listening on http://localhost:" + listener.address().port
  );
});
