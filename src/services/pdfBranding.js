import logoTnd from "../assets/logo-tnd.webp";

let logoPromise;

// Converte a imagem da navbar para PNG, preservando o contraste da logo branca.
export function carregarLogoPdf() {
  if (!logoPromise) {
    logoPromise = new Promise((resolve, reject) => {
      const imagem = new Image();
      imagem.onload = () => {
        try {
          const canvas = document.createElement("canvas");
          canvas.width = imagem.naturalWidth;
          canvas.height = imagem.naturalHeight;
          const contexto = canvas.getContext("2d");
          contexto.fillStyle = "#1e4080";
          contexto.fillRect(0, 0, canvas.width, canvas.height);
          contexto.drawImage(imagem, 0, 0);
          resolve({ data: canvas.toDataURL("image/png"), proporcao: canvas.width / canvas.height });
        } catch (error) { reject(error); }
      };
      imagem.onerror = () => reject(new Error("Não foi possível carregar a logo do relatório."));
      imagem.src = logoTnd;
    }).catch((error) => {
      logoPromise = null;
      throw error;
    });
  }
  return logoPromise;
}

export function adicionarLogoPdf(doc, logo, x, y, largura = 20) {
  doc.addImage(logo.data, "PNG", x, y, largura, largura / logo.proporcao, "logo-tnd", "FAST");
}
