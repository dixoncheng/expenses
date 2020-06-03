import contentful from "../constants/contentful";

const {
  createClient,
} = require("contentful-management/dist/contentful-management.browser.min.js");

// get asset from contentful
export const getPhoto = (accessToken: string, id: string) =>
  createClient({
    accessToken,
  })
    .getSpace(contentful.spaceId)
    .then((space: any) => space.getEnvironment(contentful.env))
    .then((environment: any) => environment.getAsset(id))
    .then((asset: any) => {
      return asset.fields.file["en-US"].url;
    })
    .catch(console.error);

export const getExpenses = (accessToken: string) =>
  createClient({
    accessToken,
  })
    .getSpace(contentful.spaceId)
    .then((space: any) => space.getEnvironment(contentful.env))
    .then((environment: any) =>
      environment.getEntries({
        content_type: contentful.contentType,
        select:
          "sys.id,fields.amount,fields.category,fields.date,fields.notes,fields.photo",
        order: "-fields.date",
      })
    )
    .then((response: any) => {
      //   console.log(response);
      const items = response.items.map(
        ({ sys, fields: { photo, date, amount, category, notes } }) => {
          return {
            id: sys.id,
            photo: photo && photo["en-US"].sys.id,
            date: date && new Date(date["en-US"]),
            amount: amount && amount["en-US"] + "",
            category: category && category["en-US"],
            notes: notes && notes["en-US"],
          };
        }
      );
      return items;
    })
    .catch(function (error: any) {
      console.log(error);
    });

export const saveExpense = (
  accessToken: string,
  item: any,
  photoUpdated,
  newPhoto
) =>
  createClient({
    accessToken,
  })
    .getSpace(contentful.spaceId)
    .then((space: any) => space.getEnvironment(contentful.env))
    .then((environment: any) => {
      const fields = {
        amount: { "en-US": parseFloat(item.amount) },
        notes: { "en-US": item.notes },
        date: { "en-US": item.date },
        category: { "en-US": item.category },
      };

      if (photoUpdated) {
        // @ts-ignore
        fields.photo = {
          "en-US": {
            sys: {
              id: newPhoto.sys.id,
              type: "Link",
              linkType: "Asset",
            },
          },
        };
      }

      if (item.id) {
        // update
        return environment.getEntry(item.id).then((entry: any) => {
          entry.fields = { ...entry.fields, ...fields };
          return entry.update();
        });
      } else {
        // create
        return environment.createEntry(contentful.contentType, {
          fields,
        });
      }
    })
    .then((entry: any) => {
      return entry.publish();
    });

export const uploadImage = async (accessToken: string, uri: string) => {
  // Why are we using XMLHttpRequest? See:
  // https://github.com/expo/expo/issues/2402#issuecomment-443726662
  const blob = await new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.onload = function () {
      resolve(xhr.response);
    };
    xhr.onerror = function (e) {
      console.log(e);
      reject(new TypeError("Network request failed"));
    };
    xhr.responseType = "arraybuffer";
    xhr.open("GET", uri, true);
    xhr.send(null);
  });

  const fileName = uri.split("/").pop();
  // console.log(fileName);

  let uriParts = uri.split(".");
  let fileType = uriParts[uriParts.length - 1];
  let contentType = `images/${fileType}`;
  // console.log(contentType);

  let fields = {
    title: {
      "en-US": fileName,
    },
    file: {
      "en-US": {
        contentType,
        fileName,
        file: blob,
      },
    },
  };

  return createClient({
    accessToken,
  })
    .getSpace(contentful.spaceId)
    .then((space: any) => space.getEnvironment(contentful.env))
    .then((environment: any) =>
      environment.createAssetFromFiles({
        fields,
      })
    )
    .then((asset: any) => {
      // console.log("processing asset...");
      return asset.processForLocale("en-US", {
        processingCheckWait: 2000,
      });
    })
    .then((asset: any) => {
      // console.log("publishing asset...");
      return asset.publish();
    })
    .then((asset: any) => {
      // console.log(asset);
      return asset;
    });
};
