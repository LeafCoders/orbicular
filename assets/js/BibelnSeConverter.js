function BibelnSeConverter(data) {
  var preLength = "<!-- document.writeln('".length;
  var postLength = "'); // -->".length;
  data = data.substring(preLength, data.length - postLength);
  return data.replace(/\\'/g, '');
}