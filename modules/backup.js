//========================================================= CORPUS OR VIEWPOINT

HypertopicMapV2.prototype.register = function(objectID, user) {
  var obj = RESTDatabase.httpGet(objectID);
  if(!obj) return false;
  if(obj.users)
  {  
    if(obj.users.indexOf(user) < 0) 
      obj.users.push(user);
  }
  else
    obj.users = [user];
    
  return RESTDatabase.httpPut(obj);
}

HypertopicMapV2.prototype.unregister = function(objectID, user) {
  var obj = RESTDatabase.httpGet(objectID);
  if(!obj) return false;
  if(!obj.users) return true;
  obj.users.remove(user);
  return RESTDatabase.httpPut(obj);
}

//====================================================================== CORPUS

/**
 * @param user e.g. "cecile@hypertopic.org"
 */
HypertopicMapV2.prototype.listCorpora = function(user) {
  var obj = RESTDatabase.httpGet("user/" + user);
  if(!obj) return false;
  return obj[user].corpus;
}

HypertopicMapV2.prototype.getCorpus = function(corpusID) {
  var obj = RESTDatabase.httpGet("corpus/" + corpusID);
  if(!obj) 
    return false;
  else
    return obj[corpusID];
}

/**
 * @return corpusID
 */
HypertopicMapV2.prototype.createCorpus = function(name, user){
  var obj = {};
  obj.corpus_name = name;
  obj.users = [user];
  var result = RESTDatabase.httpPost(obj);
  return (!result) ? false : result._id;
}

HypertopicMapV2.prototype.renameCorpus = function(corpusID, name) {
  var obj = RESTDatabase.httpGet(corpusID);
  if(!obj) return false;
  obj.corpus_name = name;
  return RESTDatabase.httpPut(obj);
}

/**
 * Destroy the nodes of the corpus and of all its documents.
 */
HypertopicMapV2.prototype.destroyCorpus = function(corpusID)
{
  //TODO
  log(corpusID, "[destroyCorpus] corpusID");
  var obj = RESTDatabase.httpGet(corpusID);
  if(!obj) return false;

  log(obj, "[destroyCorpus] obj");
  var result = RESTDatabase.httpDelete(obj);
  if(!result) return false;
  
  var items = this.listItems(corpusID);
  log(items, "[destroyCorpus] items");
  for(var i=0, documentID; documentID = items[i]; i++)
  {
    log(documentID, "[destroyCorpus] documentID");
    var obj = RESTDatabase.httpGet(documentID);
    if(!obj) continue;
    RESTDatabase.httpDelete(obj);
  }
  return true;
}

//======================================================================== ITEM
/**
 * @param corpus e.g. "MISS"
 * @param item e.g. null, or "d0" to get only an item and its fragments
 */
HypertopicMapV2.prototype.listItems = function(corpusID){
  var obj = this.getCorpus(corpusID);
  var items = [];
  for(var k in obj)
  {
    if(!"name" == k && !"user" == key)
      items.push(k);
  }
  return items;
}

HypertopicMapV2.prototype.getItem = function(corpusID, itemID) {
  var obj = this.getCorpus(corpusID);
  if(!obj) 
    return false;
  else
    return obj[itemID];
}

/**
 * @return itemID
 */
HypertopicMapV2.prototype.createItem = function(name, corpusID) {
  var object = {};
  object.item_name = name;
  object.item_corpus = corpusID;

  var result = RESTDatabase.httpPost(object);
  return (!result) ? false : result._id;
}

HypertopicMapV2.prototype.destroyItem = function(itemID){
  var object = RESTDatabase.httpGet(itemID);
  if(!object)
   return false;
  return RESTDatabase.httpDelete(object);
}

HypertopicMapV2.prototype.describeItem = function(itemID, attribute, value)
{
  var item = RESTDatabase.httpGet(itemID);
  if(!item) return false;
  if(!item[attribute])
    item[attribute] = new Array();
  item[attribute].push(value);
  return RESTDatabase.httpPut(item);
}

HypertopicMapV2.prototype.undescribeItem = function(itemID, attribute, value)
{
  var item = RESTDatabase.httpGet(itemID);
  if(!item[attribute] || !(item[attribute].length > 0)) return true;
  item[attribute].remove(value);
  if(item[attribute].length == 0)
    delete item[attribute];
  return RESTDatabase.httpPut(item);
}

HypertopicMapV2.prototype.tagItem = function(itemID, viewpointID, topicID)
{
  var item = RESTDatabase.httpGet(itemID);
  if(!item) return false;
  if(!item.topics)
    item.topics = {};
  if(!item.topics[topicID])
    item.topics[topicID] = {};
  item.topics[topicID].viewpoint = viewpointID;
  return RESTDatabase.httpPut(item);
}

HypertopicMapV2.prototype.untagItem = function(itemID, viewpointID, topicID)
{
  var item = RESTDatabase.httpGet(itemID);
  if(!item) return false;
  if(!item.topics || !item.topics[topicID]) return true;
  delete item.topics[topicID];
  return RESTDatabase.httpPut(item);
}

/**
 * @param itemID Note: replaced by a corpusID in Cassandre.
 * @return the ID of the highlight
 */
HypertopicMapV2.prototype.tagFragment = function(itemID, coordinates, text, viewpointID, topicID)
{
  var item = RESTDatabase.httpGet(itemID);
  if(!item) return false;
  
  if (!item.highlights)
    item.highlights = {};

  var highlights = {};
  highlights.coordinates = coordinates;
  highlights.text = text;
  highlights.viewpoint = viewpointID;
  highlights.topic = topicID;
  
  var highlightID = this.getUUID();
  item.highlights[highlightID] = highlights;
  RESTDatabase.httpPut(item);
  return highlightID;
}

HypertopicMapV2.prototype.untagFragment = function(itemID, highlightID)
{
  var item = RESTDatabase.httpGet(itemID);
  if(!item) return false;
  if(!item.highlights[highlightID]) return true;
  delete item.highlights[highlightID];
  return RESTDatabase.httpPut(item);
}

//=================================================================== VIEWPOINT

/**
 * @param actor e.g. "cecile@hypertopic.org"
 */
HypertopicMapV2.prototype.listViewpoints = function(user)
{
  var result = RESTDatabase.httpGet("user/" + user);
  if(!result || !result[user]) return false;
  
  var obj = result[user];
  return (obj.viewpoint) ? obj.viewpoint : false;
}

HypertopicMapV2.prototype.getViewpoint = function(viewpointID)
{
  var result = RESTDatabase.httpGet("viewpoint/" + viewpointID);
  if(!result || !result[viewpointID] ) return false;
  
  return result[viewpointID];
}

HypertopicMapV2.prototype.createViewpoint = function(name, user)
{
  
  var viewpoint = {};
  viewpoint.viewpoint_name = name;
  viewpoint.users = [ user ];

  var result = RESTDatabase.httpPost(viewpoint);
  return (!result) ? false : result._id;
}

HypertopicMapV2.prototype.renameViewpoint = function(viewpointID, name)
{
  var obj = RESTDatabase.httpGet(viewpointID);
  if(!obj) return false;
  obj.viewpoint_name = name;
  var result = RESTDatabase.httpPut(obj);
  //log(result, '[renameViewpoint] result');
  return (result) ? true : false;
}

HypertopicMapV2.prototype.destroyViewpoint = function(viewpointID)
{
  var viewpoint = RESTDatabase.httpGet(viewpointID);
  if(!viewpoint) return false;
  return RESTDatabase.httpDelete(viewpoint);
}

//TODO importViewpoint(XML, viewpointID?)
//TODO XML exportViewpoint(viewpointID)

//======================================================================= TOPIC

/**
 * @param topicID null for the virtual root
 * @return an object with broader, narrower and name 
 */
HypertopicMapV2.prototype.getTopic = function(viewpointID, topicID) 
{
  var obj = this.getViewpoint(viewpointID);
  log(obj, "[getTopic] obj:");
  log(topicID, "[getTopic] topicID:");
  
  return (obj && obj[topicID]) ? obj[topicID] : false;
}

/**
 * @param topics can be empty
 * @return topic ID
 */
HypertopicMapV2.prototype.createTopicIn = function(viewpointID, topicsIDs) 
{
  var topicID = this.getUUID();
  var viewpoint = RESTDatabase.httpGet(viewpointID);
  if(!viewpoint) return false;
  
  if(!viewpoint.topics)
    viewpoint.topics = {};
  if(!viewpoint.topics[topicID])
    viewpoint.topics[topicID] = {};
  viewpoint.topics[topicID].broader = topicsIDs;
  var result = RESTDatabase.httpPut(viewpoint);
  return (!result) ? false : topicID;
}

HypertopicMapV2.prototype.renameTopic = function(viewpointID, topicID, name)
{
  var viewpoint = RESTDatabase.httpGet(viewpointID);
  if(!viewpoint) return false;
  
  if(!viewpoint.topics)
    viewpoint.topics = {};
  if(!viewpoint.topics[topicID])
    viewpoint.topics[topicID] = {};
  viewpoint.topics[topicID].name = name;
  var result = RESTDatabase.httpPut(viewpoint);
  return (!result) ? false : result;
}

HypertopicMapV2.prototype.destroyTopic = function(viewpointID, topicID)
{
  var viewpoint = RESTDatabase.httpGet(viewpointID);
  if(!viewpoint) return false;
  if(!viewpoint.topics || !viewpoint.topics[topicID]) return true;
  delete viewpoint.topics[topicID];
  
  for(var t in viewpoint.topics)
  {
    if(viewpoint.topics[t] && viewpoint.topics[t].broader && viewpoint.topics[t].broader.length > 0)
      viewpoint.topics[t].broader.remove(topicID);
  }
  var result = RESTDatabase.httpPut(viewpoint);
  return (!result) ? false : result;
}


/**
 * @param topicID can be empty (to unlik from parents)
 */
HypertopicMapV2.prototype.moveTopicsIn = function(topicsIDs, viewpointID, topicID) 
{
  var viewpoint = RESTDatabase.httpGet(viewpointID);
  if(!viewpoint) return false;
  
  if(!viewpoint.topics) viewpoint.topics = {};
  
  for(var i=0, t; t = topicsIDs[i]; i++)
  {
    if(!viewpoint.topics[t]) viewpoint.topics[t] = {};
    
    viewpoint.topics[t].broader = new Array(topicID);
  }
  var result = RESTDatabase.httpPut(viewpoint);
  return (!result) ? false : result;
}

HypertopicMapV2.prototype.linkTopicsIn = function(topicsIDs, viewpointID, topicID) 
{
  var viewpoint = RESTDatabase.httpGet(viewpointID);
  if(!viewpoint) return false;
  
  if(!viewpoint.topics) viewpoint.topics = {};
  
  for(var i=0, t; t = topicsIDs[i]; i++)
  {
    if(!viewpoint.topics[t]) viewpoint.topics[t] = {};
    if(!viewpoint.topics[t].broader) viewpoint.topics[t].broader = new Array();
    
    viewpoint.topics[t].broader.push(topicID);
  }
  var result = RESTDatabase.httpPut(viewpoint);
  return (!result) ? false : result;
}

//==================================================================== RESOURCE

/**
 * @param resource e.g. "http://cassandre/text/d0"
 */
HypertopicMapV2.prototype.getResources = function(resource)
{
  return RESTDatabase.httpGet("resource/?resource=" + encodeURIComponent(resource));
}

//<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<< HypertopicMapV2

HypertopicMapV2.prototype.getUUID = function()
{
  var uuidGenerator = 
    Components.classes["@mozilla.org/uuid-generator;1"]
            .getService(Components.interfaces.nsIUUIDGenerator);
  var uuid = uuidGenerator.generateUUID();
  var uuidString = uuid.toString();
  
  return uuidString.replace('{', '').replace('}', '').replace(/-/gi, '');
}