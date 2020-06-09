import jimp from "jimp";
import path from "path";
import moment from "moment";
import wa from '@open-wa/wa-automate';

moment.locale("pt-br");

function pegarLinkDeImagemAleatorio() {
  return `https://picsum.photos/400/400?random=${Math.random()}`;
}

async function pegarDimensoesDaImagem(imagem) {
  const largura = await imagem.getWidth();
  const altura = await imagem.getHeight();

  return { largura, altura };
}

async function pegarDimensoesDeTexto({ font, texto }) {
  const largura = await jimp.measureText(font, texto);
  const altura = await jimp.measureTextHeight(font, texto, largura);

  return { largura, altura };
}

function pegarPosicaoCentralDeDimensao({ dimensaoImagem, dimensaoTexto }) {
  return dimensaoImagem / 2 - dimensaoTexto / 2;
}

(async function () {
  const link = pegarLinkDeImagemAleatorio();
  const imagem = await jimp.read(link);
  const dimensoesDaImagem = await pegarDimensoesDaImagem(imagem);
  const font78 = await jimp.loadFont(path.resolve("src/fonts/font78.fnt"));
  const dimensoesDaFont78 = await pegarDimensoesDeTexto({
    font: font78,
    texto: "BOM DIA",
  });
  const font28 = await jimp.loadFont(path.resolve("src/fonts/font28.fnt"));
  let dimensoesDaFont28 = await pegarDimensoesDeTexto({
    font: font28,
    texto: "Que você tenha uma ótima",
  });

  let imagemComTexto = await imagem.print(
    font78,
    pegarPosicaoCentralDeDimensao({
      dimensaoImagem: dimensoesDaImagem.largura,
      dimensaoTexto: dimensoesDaFont78.largura,
    }),
    0,
    "BOM DIA"
  );

  imagemComTexto = await imagemComTexto.print(
    font28,
    pegarPosicaoCentralDeDimensao({
      dimensaoImagem: dimensoesDaImagem.largura,
      dimensaoTexto: dimensoesDaFont28.largura,
    }),
    dimensoesDaImagem.altura - dimensoesDaFont28.altura - 60,
    "Que você tenha uma ótima"
  );

  dimensoesDaFont28 = await pegarDimensoesDeTexto({font: font28, texto: moment().format("dddd")});

  imagemComTexto = await imagemComTexto.print(
    font28,
    pegarPosicaoCentralDeDimensao({
      dimensaoImagem: dimensoesDaImagem.largura,
      dimensaoTexto: dimensoesDaFont28.largura,
    }),
    dimensoesDaImagem.altura - dimensoesDaFont28.altura - 30,
    moment().format("dddd").toUpperCase()
  );

  const imagemBase64 = await imagemComTexto.getBase64Async(jimp.MIME_JPEG);
  
  const cliente = await wa.create();

  const grupos = await cliente.getAllGroups();

  const familiares = grupos.filter(grupo => grupo.formattedTitle.indexOf("Família") !== -1);

  for(let index = 0; index < familiares.length; index++){
      await cliente.sendFile(familiares[index].id._serialized, imagemBase64, 'bomdia.jpeg', "ENVIADO DO ROBÔ DO ANDREW");
  }

})();
