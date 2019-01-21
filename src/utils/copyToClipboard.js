function fallbackCopyTextToClipboard(text) {
  return new Promise((resolve, reject) => {
    var textArea = document.createElement("textarea");
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    let success = document.execCommand("copy");
    document.body.removeChild(textArea);
    success ? resolve() : reject();
  });
}
export default function copyTextToClipboard(text) {
  return navigator.clipboard
    ? navigator.clipboard.writeText(text)
    : fallbackCopyTextToClipboard(text);
}
