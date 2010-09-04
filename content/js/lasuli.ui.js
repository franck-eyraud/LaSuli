include("resource://lasuli/modules/Observers.js");
include("resource://lasuli/modules/Sync.js");  
lasuli.ui = {
  initTabs : function(){
    var logger = Log4Moz.repository.getLogger("lasuli.ui.initTabs");
    $tabs = $('#tabs').tabs({
      tabTemplate: '<li><a href="#{href}" class="tab-viewpoint">#{label}</a> <span class="ui-icon ui-icon-close">Remove Tab</span></li>',
      selected:0,
      add: function(event, ui) {
        logger.info(ui.tab.href);
        var viewpointPanelHtml = '<div class="topics" ><p class="h3-title"><span>' + _("Index") + '</span>'
                          		 + '<img class="add-topic-img" src="css/blitzer/images/add.png"></p><ul class="topics-ul"></ul></div>'
                          		 + '<div class="fragments-container"><p class="h3-title"><span>' + _("Analysis") + '</span>'
                          		 + '<img class="add-analyses-img" src="css/blitzer/images/add.png"></p></div>';
        $(ui.panel).append(viewpointPanelHtml);
      },
      remove: function(event, ui)
      {
        logger.info(ui);
        if($('#' + ui.panel.id))
          $('#' + ui.panel.id).remove();
      }
    });
    
    $tabs.bind('tabsselect', function(event, ui) {
      var logger = Log4Moz.repository.getLogger("lasuli.ui.initTabs.tabsselect");
      if($(ui.tab).hasClass("tab-viewpoint"))
      {
        var viewpointID = $(ui.tab).attr("href").substr(1);
        logger.info(viewpointID);
        Observers.notify("lasuli.core.doLoadKeywords", viewpointID);
        Observers.notify("lasuli.core.doLoadTopics", viewpointID);
        Observers.notify("lasuli.core.doLoadFragments", viewpointID);
      }
    });
    
    $('#tabs span.ui-icon-close').live('click', function() {
      var index = $('li',$tabs).index($(this).parent());
      $tabs.tabs('remove', index);
    });
    
    $('img.add-topic-img').live('click', function(){
      var logger = Log4Moz.repository.getLogger("lasuli.ui.initTabs.add-topic-img.click");
      var viewpointID = $(this).parents('.ui-tabs-panel').attr("id");
      Observers.notify("lasuli.core.doLoadFragments", viewpointID);
    });
  },
  
  initDocumentPanel : function(){
    var browsingUrl = "http://cassandre/text/d0";
    Observers.notify("lasuli.core.doLoadDocument", browsingUrl);
  },
  
  initViewpointPanel : function(){
    var logger = Log4Moz.repository.getLogger("lasuli.ui.listViewpoints");
    $('#btn-create-viewpoint').button({
			label: _('Create'),
			icons: {
				primary: 'ui-icon-circle-plus'
			}
		}).click(function(){
		  var viewpointName = $.trim($(this).prev().val());
		  if(viewpointName == "")
		  {
		    var message = {"title": _("Warning"), "content": _('create.viewpoint.warning')};
		    Observers.notify("lasuli.ui.doShowMessage", message);
		    return false;
		  }
		  logger.debug("Create viewpoint button click.\nViewpoint name:" + viewpointName);
		  Observers.notify("lasuli.core.doCreateViewpoint", viewpointName);
		});
		
		var resizeInput = function(){
		  $('div#create-viewpoint input').width( $('#tabs').innerWidth() - 130);
		};
		//Resize the input box
		$(window).resize(resizeInput);
		resizeInput();
		
		//Noticy the core to load all viewpoints.
		Observers.notify("lasuli.core.doListViewpoints", null);
		
		//When click enter key also create viewpoint
		$('#txtViewpoint').keyup(function(event){
      if (event.keyCode == 13)
        $('#btn-create-viewpoint').trigger('click');
    });
    
		$('#viewpoints-ul li').live('mouseover', function(){
      $(this).find("img").stop().animate({opacity: 1}, 250);
      //$(this).stop().animate({marginLeft : -26}, 250);
    });
    $('#viewpoints-ul li').live('mouseout', function(){
      $(this).find("img").stop().animate({opacity: 0}, 250);
      //$(this).stop().animate({marginLeft : 0}, 250);
    });
    //Click the trash icon to delete a viewpoint
    $('.icon-remove-viewpoint').live('click', function(){
      var viewpointID = $(this).parent().attr('id');
      var viewpointName = $(this).next().text();
      var message = {};
      message.title = _("Warning");
      message.content = _("delete.viewpoint.warning", [viewpointName]);
      message.callback = function() {
        Observers.notify("lasuli.core.doDestroyViewpoint", viewpointID);
      };
      Observers.notify("lasuli.ui.doShowMessage", message);
    });
    $('#viewpoints-ul li a').live('click', function(){
      var viewpointID = $(this).parent().attr("id");
      var viewpoints = new Array(viewpointID);
      Observers.notify("lasuli.ui.doShowViewpointPanels", viewpoints);
      return false;
    });
  },
  
  initAttributeGrid : function(){
    
    $("#attribute-dialog").dialog({
      bgiframe: true,
      autoOpen: false,
      modal: true,
      width: 170,
      title: _("add-attribute-dialog-title"),
      buttons: {
        'OK': function() {
          var bValid = true;
          $('#attribute-name').removeClass('ui-state-error');
          $('#attribute-value').removeClass('ui-state-error');
          if ( $('#attribute-name').val().length == 0)
          {
            $('#attribute-name').addClass('ui-state-error');
            bValid = false;
          }
          
          if ( $('#attribute-value').val().length == 0) 
          {
            $('#attribute-value').addClass('ui-state-error');
            bValid = false;
          }
          
          if (bValid) {
            var attribute = {"name": $('#attribute-name').val(), "value": $('#attribute-value').val()};
            Observers.notify("lasuli.core.doCreateAttribute", attribute);
            $('#attribute-dialog').dialog('close');
          }
        }
      },
      close: function() 
      {
        $('#attribute-name').removeClass('ui-state-error');
        $('#attribute-value').removeClass('ui-state-error');
      }
    });
    
    $('#attribute-name').keyup(function(event){
      if (event.keyCode == 13)
        $('#attribute-value').focus().select();
    });
    $('#attribute-value').keyup(function(event){
      if (event.keyCode == 13)
        $('#attribute-dialog').dialog('option','buttons').OK();
    });
    
    //If the jqGrid script isn't loaded yet.
    while(!("jqGrid" in $("#attribute-grid")))
      Sync.sleep(10);
    
		$("#attribute-grid").jqGrid({
      url: "#",
      datatype: "local",
      height: "100%",
      width: "98%",
      colNames:[_('name'),_('value')],
      colModel:[
           {name:'name', index:'name',editable:true},
           {name:'value', index:'value',editable:true}    
         ],
      sortname: 'name',
      viewrecords: true,
      sortorder: "desc",
      multiselect: false,
      cellsubmit: 'clientArray',
      toolbar: [true, "bottom"],
      caption: _("attributes")
    });
    $(window).bind('resize', function() {
        $("#attribute-grid").setGridWidth($('#h3-entity-name').width());
    }).trigger('resize');
    //initial toolbar
    $('#t_attribute-grid').html("<button id='attribute-del'></button><button id='attribute-modify' class='hide'></button><button id='attribute-add'></button>");
    $('#attribute-add').button({
			text: false,
			icons: {
				primary: 'ui-icon-plus'
			}
		}).click(function(){ $('#attribute-dialog').dialog('open'); });
		  
		//Delete selected attribute
		$('#attribute-del').button({
			text: false,
			icons: {
				primary: 'ui-icon-trash'
			}
		}).click(function(){
		  var gr = $("#attribute-grid").jqGrid('getGridParam','selrow');
      if( gr != null )
      {
        var data = $("#attribute-grid").jqGrid('getRowData',gr);
        var attribute = {"name": data.name, "value": data.value};
        Observers.notify("lasuli.core.doDestroyAttribute", attribute);
      }
      else
      {
        var message = {};
        message.title = _("Warning");
        message.content = _("no-attribute-selected");
        Observers.notify("lasuli.ui.doShowMessage", message);
      }
		});
		//Modify selected attribute
		/*$('#attribute-modify').button({
			text: false,
			icons: {
				primary: 'ui-icon-pencil'
			}
		}).click(function(){
		  var gr = $("#attribute-grid").jqGrid('getGridParam','selrow');
      if( gr != null )
        $('#attribute-dialog').dialog('open');
      else
      {
        var message = {};
        message.title = _("Warning");
        message.content = _("no-attribute-selected");
        Observers.notify("lasuli.ui.doShowMessage", message);
      }
		});*/
  },
  
  initTagCloud : function(){
    $("#tags").contextMenu({
        menu: "tagcloudContextMenu"
    },
    function(action, el, pos) 
    {
      switch(action)
      {
        case "tagcloudSwitcher":
          if($("#tags ul").hasClass("alt"))
            $("#tags ul").hide().removeClass("alt").fadeIn("fast");
          else
            $("#tags ul").hide().addClass("alt").fadeIn("fast");
          return;
        case "tagcloudSortAlphabetically":
          if($(".tagcloudSortAlphabetically").data("desc"))
          {
            $("#tags ul li").tsort({order:"desc"});
            $(".tagcloudSortAlphabetically").data("desc", false);
          }
          else
          {
            $(".tagcloudSortAlphabetically").data("desc", true);
            $("#tags ul li").tsort({order:"asc"});
          }
          return;
        case "tagcloudSortByStrength":
          if($(".tagcloudSortByStrength").data("desc"))
          {
            $(".tagcloudSortByStrength").data("desc", false);
            $("#tags ul li").tsort({order:"asc",attr:"class"});
          }
          else
          {
            $(".tagcloudSortByStrength").data("desc", true);
            $("#tags ul li").tsort({order:"desc",attr:"class"});
          }
          return;
      }
    });
  },
  
  //Auto register all observers
  register: function(){
    var logger = Log4Moz.repository.getLogger("lasuli.ui.register");
    for(var func in this)
      if(func.substr(0, 2) == "do")
      {
        //logger.debug("registering function: " + func);
        Observers.add("lasuli.ui." + func, lasuli.ui[func], lasuli.ui);
      }
  },
  unregister: function(){
    for(var func in this)
      if(func.substr(0, 2) == "do")
        Observers.remove("lasuli.ui." + func, lasuli.ui[func], lasuli.ui);
  },
  
  doShowMessage : function(subject, data){
    var msgTitle = (typeof(subject.title) == "string") ? subject.title : "Information";
    $("#message").html(subject.content);
    if(subject.callback)
    {
      $("#message-dialog").dialog('destroy');
      var i18nButtons = {};
      i18nButtons[_('Cancel')] = function() { $(this).dialog('close');  };
  	  i18nButtons[_('Okay')] = function() { $(this).dialog('close');  subject.callback();  };
      $("#message-dialog").dialog({
        autoOpen: true,
        modal: true,
        width: 150,
        buttons: i18nButtons
      });
    }
    else
    {
    	var i18nButtons = {};
      i18nButtons[_('Okay')] = function() { $(this).dialog('close');  };
      $("#message-dialog").dialog('destroy');
      $("#message-dialog").dialog({
        bgiframe: true,
        autoOpen: true,
        modal: true,
        width: 150,
        buttons: i18nButtons
      });
    }
    $("#ui-dialog-title-message-dialog").html(msgTitle);
  },
  
  doShowViewpoints : function(viewpoints){
    var logger = Log4Moz.repository.getLogger("lasuli.ui.doShowViewpoints");
    logger.debug(viewpoints);
    $('#viewpoints-ul li').hide().remove();
    logger.debug(typeof(viewpoints));
    logger.debug(viewpoints.length);
    if(typeof(viewpoints) == "object" && viewpoints.length > 0)
      for(var i=0, viewpoint; viewpoint = viewpoints[i]; i++){
        logger.debug("adding:" + viewpoint.name);
        $("#viewpoints-ul").append("<li id='" + viewpoint.id + "'><img src='css/blitzer/images/delete.png' class='icon-remove-viewpoint'><a>"
                                   + viewpoint.name + "</a></li>");
      }
  },
  
  doShowUsers : function(users){
    $("#actors ul li").hide().remove();
    if(!users) return;
    users.sort();
    for(var i=0, user; user = users[i]; i++)
    {
      var content = "<li class='actor'><a uri='" + user + "'>" + user + "</a></li>";
      $("#actors ul").append(content);
    }
    $("li.actor a").click(function(){
      var user = $(this).attr("uri");
      Observers.notify("lasuli.core.doOpenViewpointByUser", user);
      return false;
    });
  },
  
  doShowItemName : function(itemName){
    var logger = Log4Moz.repository.getLogger("lasuli.ui.doShowItemName");
    logger.debug(itemName);
    if(!itemName) itemName = _("no.name");
    $("#h3-entity-name").html(itemName);
  },
  
  doShowAttributes : function(attributes){
    var logger = Log4Moz.repository.getLogger("lasuli.ui.doShowAttributes");
    logger.debug(attributes);
    $("#attribute-grid").jqGrid('clearGridData');
    if(!attributes) return false;
    var index = 1;
    for(var name in attributes)
      if(typeof(attributes[name]) == "string")
      {
        logger.debug({"name": name, "value": attributes[name]});
        $("#attribute-grid").addRowData(index, {"name": name, "value": attributes[name]});
        index++;
      }
      else
      for(var j=0, v; v = attributes[name][j]; j++)
      {
        logger.debug({"name": name, "value": v});
        $("#attribute-grid").addRowData(index, {"name": name, "value": v});
        index++;
      }
  },
  
  doShowTopics : function(topics){
    var logger = Log4Moz.repository.getLogger("lasuli.ui.doShowTopics");
    logger.debug(topics);
    $("#tags ul li").hide().remove();
    if(!topics) return false;
    
    var tags = {};
    for(var i=0, topic; topic = topics[i]; i++)
      if(!tags[topic.name])
        tags[topic.name] = 1;
      else
        tags[topic.name] = tags[topic.name] + 1;
    
    var max = 0;
    var min = 32768;
    for(var name in tags)
    {
      if(tags[name] > max) max = tags[name];
      if(tags[name] < min) min = tags[name];
    }
    //var_dump("UI.init.js", "max:" + max + ", min:" + min, 4);
    for(var name in tags)
    {
      var size = Math.round((tags[name] - min) / (max-min) * 4) + 1;
      //var_dump("UI.init.js", "topics[name].length:" + topics[name].length, 4);
      var content = "<li class='tag" + size + "'><a>" + name + "</a></li>";
      $("#tags ul").append(content);
    }
    $(".tagcloudSortAlphabetically").data("desc", true);
    $("#tags ul li").tsort({order:"asc"});
    $("#tags ul li a").click(function(){
      var topicName = $(this).text();
      Observers.notify("lasuli.core.doOpenViewpointByTopicName", topicName);
      return false;
    });
  },
  
  doShowViewpointPanels : function(viewpoints){
    var logger = Log4Moz.repository.getLogger("lasuli.ui.doShowViewpointPanels");
    if(!viewpoints) return false;
    //logger.debug(viewpoints);
    var tabIndex = -1;
    for(var i=0, viewpoint; viewpoint = viewpoints[i]; i++)
    {
      //If this viewpoint tab is already created.
      if($("#"+viewpoint.id).length > 0) continue;
      //Create the tab for this viewpoint
      logger.info("adding viewpoint:" + viewpoint.id + ", " + viewpoint.name);
      tabIndex = $tabs.tabs('length')-1;
      $tabs.tabs('add', '#' + viewpoint.id, viewpoint.name, tabIndex);
    }
    
    //Open created tab
    if(tabIndex > 0)
      $tabs.tabs('option', 'selected', tabIndex);
    else
      $("#tabs ul li").each(function(){
        if($(this).find("a").attr("href") == "#" + viewpoints[0].id)
          $(this).find("a").click();
      });
  },
  
  doClearDocumentPanel : function(){
    var logger = Log4Moz.repository.getLogger("lasuli.ui.doClearDocumentPanel");
    logger.info("clear the document panel");
    // Clear the document name
    $("#h3-entity-name").html(_("no.name"));
    // Clear the attribute grid
    $("#attribute-grid").jqGrid('clearGridData');
    // Clear the tag cloud
    $("#tags ul li").hide().remove();
    // Clear the users list
    $("#actors ul li").hide().remove();
  }
}


$(window).bind("load", function(){
  lasuli.jqGirdLoader();
  lasuli.ui.register();
  lasuli.ui.initTabs();
  lasuli.ui.initViewpointPanel();
  lasuli.ui.initAttributeGrid();
  lasuli.ui.initTagCloud();
  lasuli.ui.initDocumentPanel();
  
});

$(window).bind("unload", function(){
  lasuli.ui.unregister();
});