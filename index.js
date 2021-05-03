const { writeFile } = require("fs");
const { join } = require("path");
const rp = require("request-promise");
const blend = require("@mapbox/blend");
const argv = require("minimist")(process.argv.slice(2));

const {
  greeting = "Hello",
  who = "You",
  width = 400,
  height = 500,
  color = "Pink",
  size = 100,
} = argv;

const getImages = (text, width, height, color, size) => {
  const API_URL = `https://cataas.com/cat/says/${text}?width=${width}&height=${height}&c=${color}&s=${size}`;

  const options = {
    uri: API_URL,
    method: "GET",
    encoding: "binary",
    headers: {
      "Content-type": "image/png",
    },
  };

  return rp(options);
};

const image1Promise = getImages(greeting, width, height, color, size);
const image2Promise = getImages(who, width, height, color, size);
const promiseArray = [image1Promise, image2Promise];

Promise.all(promiseArray)
  .then((res) => {
    blend(
      [
        {
          buffer: new Buffer.from(res[0], "binary"),
          x: 0,
          y: 0,
        },
        { buffer: new Buffer.from(res[1], "binary"), x: width, y: 0 },
      ],
      {
        width: width * 2,
        height: height,
        format: "jpeg",
      },
      (err, data) => {
        if (err) {
          console.log(err);
          return;
        }
        const fileOut = join(process.cwd(), `/cat-card.jpg`);
        writeFile(fileOut, data, "binary", (err) => {
          if (err) {
            console.log(err);
            return;
          }
          console.log("The file was saved!");
        });
      }
    );
  })
  .catch((err) => console.log(err));
