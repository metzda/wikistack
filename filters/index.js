module.exports = function(swig) {

  var pageLink = function (page) {
    return '<a href="' + page.route + '">' + page.title + '</a>';
  };

  pageLink.safe = true;

  var userLink = function (user) {
      console.log(user);
    return '<a href="users/' + user._id.toString() + '">' + user.name + '</a>';
  };

  userLink.safe = true;
    
  var tagLinks = function (tags) {
    var linkString = '';
    if (tags)
        tags.forEach(function(tag) {
            linkString += '<a href=search?tag=' + tag + '>' + tag + '</a> ';
        });
    return linkString;
  };

  tagLinks.safe = true;
    
  swig.setFilter('pageLink', pageLink);
  swig.setFilter('userLink', userLink);
  swig.setFilter('tagLinks', tagLinks);

};