const Cc = Components.classes;
const Ci = Components.interfaces;
const Cu = Components.utils;

/**
 * LaSuli namespace.
 */
var lasuli = {
  jsBaseDir : "chrome://lasuli/content/js/",
  _baseUrl: 'http://127.0.0.1', //TODO: default server uri
  _username: 'user@hypertopic.org',
  _password: 'no-need',
  _map: null,
  
  getLocalDirectory : function() {
    var directoryService =
      Cc["@mozilla.org/file/directory_service;1"].
        getService(Ci.nsIProperties);
    // this is a reference to the profile dir (ProfD) now.
    var localDir = directoryService.get("ProfD", Ci.nsIFile);
  
    localDir.append("lasuli");
  
    if (!localDir.exists() || !localDir.isDirectory()) {
      // read and write permissions to owner and group, read-only for others.
      localDir.create(Ci.nsIFile.DIRECTORY_TYPE, 0774);
    }
  
    return localDir;
  },
  
  // Setup log4moz
  setupLogging: function() {
    // The basic formatter will output lines like:
    // DATE/TIME	LoggerName	LEVEL	(log message) 
    var formatter = new lasuli.Log4Moz.BasicFormatter();
  
    // Loggers are hierarchical, lowering this log level will affect all output
    var root = lasuli.Log4Moz.repository.rootLogger;
    if(root.appenders.length > 0) return;
    root.level = lasuli.Log4Moz.Level["All"];
    
    /*var dapp = new lasuli.Log4Moz.DumpAppender(formatter);
    dapp.level = lasuli.Log4Moz.Level["Debug"];
    root.addAppender(dapp);*/
    
    var capp = new lasuli.Log4Moz.ConsoleAppender(formatter);
    capp.level = lasuli.Log4Moz.Level["All"];
    root.addAppender(capp);
    /*
    var logFile = lasuli.getLocalDirectory();
    logFile.append("log.txt");
    var appender = new lasuli.Log4Moz.RotatingFileAppender(logFile, formatter);
    appender.level = lasuli.Log4Moz.Level["Debug"];
    root.addAppender(appender);*/
  }
};

Cu.import("resource://lasuli/modules/log4moz.js", lasuli);