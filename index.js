"use strict";
const fs = require("fs");
const pasta = "./original";
const parser = require("xml2json");

// cons = require('parse-kmz');

async function main(fs) {
  // const kml .toJson('./original/teste.kml')

  // console.log(kml);

  // return undefined

  const kml = await findFiles(fs);
  // // console.log(kml)
  const fileFull = fs.readFileSync(kml);

  // const option = {
  //   reversible: true
  // }

  const json = parser.toJson(fileFull);

  await fs.writeFileSync(
    "./final.json",
    JSON.parse(JSON.stringify(json, null, 2))
  );
  // return undefined
  // return undefined

  const parsed = require("./final.json");

  // console.log((parsed.kml.Document.Folder.name))
  // return undefined
  const pastaCaixas = parsed.kml.Document.Folder;
  let return2Xml;

  switch (pastaCaixas.name) {
    case "NAP":
      let pastaNaps = await setNameNap(pastaCaixas);
      console.log("length pastasnaps ", pastaNaps.length);
      console.log("retorno do map ", pastaNaps);
      return2Xml = parser.toXml(pastaNaps);
      break;
    case "HUB":
      const pastaHUB = await setNameHUB(pastaCaixas);
      break;
    case "EMENDA":
      const pastaEmenda = await setNameEmenda(pastaCaixas);
      break;
  }

  // console.log(return2Xml);

  // const OptTransform = {
  //   sanitize: true
  // }

  // return undefined

  // console.log('return2Xml', typeof return2Xml)
  let sanitize = return2Xml;
  sanitize = sanitize.substring(
    sanitize.indexOf('<Folder name="NAP"'),
    sanitize.length
  );
  sanitize = sanitize.replace(
    '<Folder name="NAP"',
    '<?xml version="1.0" encoding="UTF-8"?><kml xmlns="http://www.opengis.net/kml/2.2" xmlns:gx="http://www.google.com/kml/ext/2.2" xmlns:kml="http://www.opengis.net/kml/2.2" xmlns:atom="http://www.w3.org/2005/Atom"><Document>'
  );
  sanitize = sanitize.replace('description="', "<name>NAP.kml</name>");
  sanitize = sanitize.replace("CAIXA DE ATENDIMENTO A CLIENTE", "");
  sanitize = sanitize.replace("GPON:", "");
  sanitize = sanitize.replace("1x Caixa CTO", "");
  sanitize = sanitize.replace("1x Splitter 1:16  Conectorizado (2º Nivel)", "");
  sanitize = sanitize.replace('Alinhadores, Bandejas, etc">', "");
  sanitize = sanitize.replace('<Folder name="', "<Folder><name>");
  sanitize = sanitize.replace('<Folder name="', "<Folder><name>");
  sanitize = sanitize.replace(
    '"><Placemark>',
    '</name><Placemark styleUrl="#m_ylw-pushpin0011310" name="CTO.'
  );
  for (let index = 0; index < 65; index++) {
    sanitize = sanitize.replace(
      '<Placemark styleUrl="#m_ylw-pushpin0011310" name="CTO.',
      "<Placemark><styleUrl>#m_ylw-pushpin0011310</styleUrl><name>CTO."
    );
    sanitize = sanitize.replace(
      '"><Camera longitude="',
      "</name><Camera><longitude>"
    );
    sanitize = sanitize.replace(
      '"><LookAt longitude="',
      "</name><LookAt><longitude>"
    );
    sanitize = sanitize.replace('" latitude="', "</longitude><latitude>");
    sanitize = sanitize.replace('" altitude="', "</latitude><altitude>");
    sanitize = sanitize.replace('" heading="', "</altitude><heading>");
    sanitize = sanitize.replace('" tilt="', "</heading><tilt>");
    sanitize = sanitize.replace('" roll="', "</tilt><roll>");
    sanitize = sanitize.replace(
      '" gx:altitudeMode="',
      "</roll><gx:altitudeMode>"
    );
    sanitize = sanitize
      .replace('" range="', "</tilt><range>")
      .replace("</roll><gx:altitudeMode>", "</range><gx:altitudeMode>");
    // sanitize = sanitize.replace('</roll><gx:altitudeMode>', '</range><gx:altitudeMode>')
    sanitize = sanitize.replace(
      '></Camera><Point gx:drawOrder="1" coordinates="',
      "</gx:altitudeMode></Camera><Point><gx:drawOrder>1</gx:drawOrder><coordinates>"
    );
    sanitize = sanitize.replace(
      '"></Point></Placemark>',
      "</coordinates></Point></Placemark>"
    );
  }

  return fs.writeFileSync("./MASTERINFO - FTTH/final.kml", sanitize);

  const nomeProjeto = parsed.kml.Document.Folder.name;
}

function setNameEmenda(pastaCaixas) {
  const arrEmendaDerivacao = pastaCaixas[0].Folder.filter(
    (R) => R.name === "EMENDA"
  );
  // console.log('arrEmendaDerivacao', arrEmendaDerivacao[0].Folder)
  for (let index = 0; index < arrEmendaDerivacao[0].Folder.length; index++) {
    if (arrEmendaDerivacao[0].Folder[index].Placemark) {
      const name = `CEO.${arrEmendaDerivacao[0].Folder[index].name.slice(
        5,
        8
      )}`;
      let array = arrEmendaDerivacao[0].Folder[index].Placemark;
      array.name = name;
    }
  }
  return arrEmendaDerivacao;
}

function setNameHUB(pastaCaixas) {
  const arrHubs = pastaCaixas[0].Folder.filter((R) => R.name === "HUB");
  for (let index = 0; index < arrHubs[0].Folder.length; index++) {
    const name = `H.${arrHubs[0].Folder[index].name.slice(5, 8)}`;
    let array = arrHubs[0].Folder[index].Placemark;
    array.name = name;
  }
  return arrHubs;
}

async function setNameNap(pastaCaixas) {
  console.log("caiu aqui", pastaCaixas.Folder.length);

  let arrNaps = pastaCaixas.Folder;
  let count = 1;
  for (let index = 0; index < arrNaps.length; index++) {
    const array = arrNaps[index].Placemark;
    await array.forEach((element) => {
      element.name = `CTO.${arrNaps[index].name.slice(5, 8)}`;
      if (arrNaps[index].Placemark.length < count) {
        count = 1;
      }
      element.LookAt !== undefined
        ? (element.LookAt.altitude = undefined)
        : (element.Camera.altitude = undefined);
      element.LookAt !== undefined
        ? (element.LookAt.heading = undefined)
        : (element.Camera.heading = undefined);
      element.LookAt !== undefined
        ? (element.LookAt.tilt = undefined)
        : (element.Camera.tilt = undefined);
      element.LookAt !== undefined
        ? (element.LookAt.roll = undefined)
        : (element.Camera.roll = undefined);
      element.LookAt !== undefined
        ? (element.LookAt.range = undefined)
        : (element.Camera.range = undefined);
      // element.LookAt !== undefined ? element.LookAt.Point.'gx:drawOrder' = undefined : element.Camera.Point.'gx:drawOrder' = undefined
      element.name = element.name + `.0${count}`;
      element;
      count++;
    });
  }
  arrNaps = await JSON.parse(JSON.stringify(arrNaps));
  // console.log(
  //   "arrNaps",
  //   arrNaps[0].Placemark.map((R) => R.filter((Res) => Res === "Camera"))
  //   // ? arrNaps[0].Placemark.Camera
  //   // : arrNaps[0].Placemark.LookAt
  // );
  let arrNapsAux = {};
  for (let index = 0; index < arrNaps.length; index++) {
    // arrNaps.map((R) => console.log(typeof R.Placemark[index].LookAt));
    arrNapsAux = await arrNaps.map((R) => ({
      Folder: R.name,
      name: R.name,
      Placemark: {
        LookAt: {
          longitute: R.Placemark[index].Camera.longitute
            ? R.Placemark[index].Camera.longitute ||
              R.Placemark[index].LookAt.longitute
            : R.Placemark[index].LookAt.longitute ||
              R.Placemark[index].Camera.longitute,
          latitude: R.Placemark[index].Camera.latitude
            ? R.Placemark[index].Camera.latitude ||
              R.Placemark[index].LookAt.latitude
            : R.Placemark[index].LookAt.latitude ||
              R.Placemark[index].Camera.latitude,
          gx: {
            altitudeMode: "relativeToSeaFloor",
          },
        },
        styleUrl: "#m_ylw-pushpin0011310",
        Point: {
          gx: {
            drawOrder: "1",
          },
          coordinates: R.Placemark[index].Point,
        },
      },
    }));
  }
  // console.log(arrNapsAux);
  return arrNapsAux;
}

async function findFiles(fs) {
  let nmFile = await fs
    .readdirSync(`${pasta}`)
    .filter((nome) => nome.indexOf(".kml") !== -1 || nome.indexOf(".kml"));
  nmFile = `${pasta}/${nmFile.toString()}`;
  return nmFile;
}

main(fs); //
