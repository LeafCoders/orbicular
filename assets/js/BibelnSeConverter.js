function BibelnSeConverter(data) {
  var preLength = "<!-- document.writeln('".length;
  var postLength = "'); // -->".length;
  data = data.substring(preLength, data.length - postLength);
  data = data.replace("<p align=\\'right\\'>", "<div>");
  data = data.replace("</p>", "</div>");
  return data.replace(/\\'/g, "");
}