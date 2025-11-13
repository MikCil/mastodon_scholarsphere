var sigInst, canvas, $GP

//Load configuration file
var config = {};

//For debug allow a config=file.json parameter to specify the config
function GetQueryStringParams(sParam, defaultVal) {
    var sPageURL = "" + window.location; //.search.substring(1);//This might be causing error in Safari?
    if (sPageURL.indexOf("?") == -1) return defaultVal;
    sPageURL = sPageURL.substr(sPageURL.indexOf("?") + 1);
    var sURLVariables = sPageURL.split('&');
    for (var i = 0; i < sURLVariables.length; i++) {
        var sParameterName = sURLVariables[i].split('=');
        if (sParameterName[0] == sParam) {
            return sParameterName[1];
        }
    }
    return defaultVal;
}


jQuery.getJSON(GetQueryStringParams("config", "config.json"), function(data, textStatus, jqXHR) {
    config = data;

    if (config.type != "network") {
        //bad config
        alert("Invalid configuration settings.")
        return;
    }

    //As soon as page is ready (and data ready) set up it
    $(document).ready(setupGUI(config));
}); //End JSON Config load


// FUNCTION DECLARATIONS

Object.size = function(obj) {
    var size = 0,
        key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }
    return size;
};

// Create a function to extract single discipline colors
function extractSingleDisciplineColors() {
    const disciplineColorMap = {};
    
    sigInst.iterNodes(function(node) {
        if (node.attr && node.attr.attributes && node.attr.attributes.disciplines) {
            const discipline = node.attr.attributes.disciplines;
            
            // Only process nodes with single disciplines (no pipe character)
            if (!discipline.includes('|')) {
                // Store the color for this discipline
                disciplineColorMap[discipline] = node.color;
            }
        }
    });
    
    return disciplineColorMap;
}

// Function to hide discipline legend
function hideDisciplineLegend() {
    const legend = document.getElementById('discipline-legend');
    if (legend) {
        legend.style.display = 'none';
        
        // Update button text if it exists
        const legendToggle = document.getElementById('legend-toggle');
        if (legendToggle) {
            legendToggle.textContent = 'Show Discipline Legend';
        }
    }
}

// Function to show discipline legend
function showDisciplineLegend() {
    let legend = document.getElementById('discipline-legend');
    if (!legend) {
        addDisciplineLegend();
    } else {
        legend.style.display = 'block';
    }
    
    // Update button text
    const legendToggle = document.getElementById('legend-toggle');
    if (legendToggle) {
        legendToggle.textContent = 'Hide Discipline Legend';
    }
}

// Create and add the legend to the page
function addDisciplineLegend() {
    const disciplineColors = extractSingleDisciplineColors();
    
    // Create the legend container if it doesn't exist
    let legendContainer = document.getElementById('discipline-legend');
    if (!legendContainer) {
        legendContainer = document.createElement('div');
        legendContainer.id = 'discipline-legend';
        legendContainer.className = 'legend-container';
        
        // Add title
        const legendTitle = document.createElement('h3');
        legendTitle.textContent = 'Disciplines';
        legendContainer.appendChild(legendTitle);
        
        // Add close button inside legend
        const closeButton = document.createElement('div');
        closeButton.className = 'legend-close-button';
        closeButton.textContent = '×';
        closeButton.style.position = 'absolute';
        closeButton.style.top = '5px';
        closeButton.style.right = '10px';
        closeButton.style.cursor = 'pointer';
        closeButton.style.fontSize = '20px';
        closeButton.style.fontWeight = 'bold';
        closeButton.addEventListener('click', hideDisciplineLegend);
        legendContainer.appendChild(closeButton);
        
        // Style the legend container
        Object.assign(legendContainer.style, {
            position: 'absolute',
            top: '60px',
            right: '20px', // Changed from right to left to avoid info panel overlap
            backgroundColor: 'white',
            padding: '10px',
            border: '1px solid #ccc',
            borderRadius: '5px',
            maxHeight: '400px',
            overflowY: 'auto',
            zIndex: '1000'
        });
        
        // Add the legend items
        const disciplineList = document.createElement('ul');
        disciplineList.style.listStyle = 'none';
        disciplineList.style.padding = '0';
        disciplineList.style.margin = '0';
        
        // Sort disciplines alphabetically
        const sortedDisciplines = Object.keys(disciplineColors).sort();
        
        sortedDisciplines.forEach(discipline => {
            const color = disciplineColors[discipline];
            const item = document.createElement('li');
            item.style.margin = '5px 0';
            item.style.display = 'flex';
            item.style.alignItems = 'center';
            
            const colorSwatch = document.createElement('span');
            colorSwatch.style.display = 'inline-block';
            colorSwatch.style.width = '20px';
            colorSwatch.style.height = '20px';
            colorSwatch.style.backgroundColor = color;
            colorSwatch.style.marginRight = '10px';
            colorSwatch.style.border = '1px solid #999';
            colorSwatch.style.borderRadius = '3px';
            
            const disciplineName = document.createElement('span');
            disciplineName.textContent = discipline;
            
            item.appendChild(colorSwatch);
            item.appendChild(disciplineName);
            disciplineList.appendChild(item);
        });
        
        legendContainer.appendChild(disciplineList);
        
        // Add to page
        document.body.appendChild(legendContainer);
    } else {
        legendContainer.style.display = 'block';
    }
}

// Function to output discipline-color mapping to console
function outputDisciplineColorMap() {
    const disciplineColors = extractSingleDisciplineColors();
    console.log("Discipline Color Map:");
    console.table(disciplineColors);
    return disciplineColors; // Return for further use if needed
}

function initSigma(config) {
    var data = config.data

    var drawProps, graphProps, mouseProps;
    if (config.sigma && config.sigma.drawingProperties)
        drawProps = config.sigma.drawingProperties;
    else
        drawProps = {
            defaultLabelColor: "#000",
            defaultLabelSize: 14,
            defaultLabelBGColor: "#ddd",
            defaultHoverLabelBGColor: "#002147",
            defaultLabelHoverColor: "#fff",
            labelThreshold: 10,
            defaultEdgeType: "curve",
            hoverFontStyle: "bold",
            fontStyle: "bold",
            activeFontStyle: "bold"
        };

    if (config.sigma && config.sigma.graphProperties)
        graphProps = config.sigma.graphProperties;
    else
        graphProps = {
            minNodeSize: 1,
            maxNodeSize: 7,
            minEdgeSize: 0.2,
            maxEdgeSize: 0.5
        };

    if (config.sigma && config.sigma.mouseProperties)
        mouseProps = config.sigma.mouseProperties;
    else
        mouseProps = {
            minRatio: 0.75, // How far can we zoom out?
            maxRatio: 20, // How far can we zoom in?
        };

    var a = sigma.init(document.getElementById("sigma-canvas")).drawingProperties(drawProps).graphProperties(graphProps).mouseProperties(mouseProps);
    sigInst = a;
    a.active = !1;
    a.neighbors = {};
    a.detail = !1;


    dataReady = function() { //This is called as soon as data is loaded
        a.clusters = {};

        a.iterNodes(
            function(b) { //This is where we populate the array used for the group select box

                // note: index may not be consistent for all nodes. Should calculate each time. 
                // alert(JSON.stringify(b.attr.attributes[5].val));
                // alert(b.x);
                a.clusters[b.color] || (a.clusters[b.color] = []);
                a.clusters[b.color].push(b.id); //SAH: push id not label
            }

        );

        a.bind("upnodes", function(a) {
            nodeActive(a.content[0])
        });

        a.draw();
        
        // Output discipline color mapping to console
        outputDisciplineColorMap();
        
        configSigmaElements(config);
    }

    if (data.indexOf("gexf") > 0 || data.indexOf("xml") > 0)
        a.parseGexf(data, dataReady);
    else
        a.parseJson(data, dataReady);
    gexf = sigmaInst = null;
}


function setupGUI(config) {
    // Initialise main interface elements
    var logo = ""; // Logo elements
    if (config.logo.file) {

        logo = "<img src=\"" + config.logo.file + "\"";
        if (config.logo.text) logo += " alt=\"" + config.logo.text + "\"";
        logo += ">";
    } else if (config.logo.text) {
        logo = "<h1>" + config.logo.text + "</h1>";
    }
    if (config.logo.link) logo = "<a href=\"" + config.logo.link + "\">" + logo + "</a>";
    $("#maintitle").html(logo);

    // #title
    $("#title").html("<h2>" + config.text.title + "</h2>");

    // #titletext
    $("#titletext").html(config.text.intro);

    // More information
    if (config.text.more) {
        $("#information").html(config.text.more);
    } else {
        //hide more information link
        $("#moreinformation").hide();
    }

    // Legend

    // Node
    if (config.legend.nodeLabel) {
        $(".node").next().html(config.legend.nodeLabel);
    } else {
        //hide more information link
        $(".node").hide();
    }
    // Edge
    if (config.legend.edgeLabel) {
        $(".edge").next().html(config.legend.edgeLabel);
    } else {
        //hide more information link
        $(".edge").hide();
    }
    // Colours
    if (config.legend.nodeLabel) {
        $(".colours").next().html(config.legend.colorLabel);
    } else {
        //hide more information link
        $(".colours").hide();
    }

    $GP = {
        calculating: !1,
        showgroup: !1
    };
    $GP.intro = $("#intro");
    $GP.minifier = $GP.intro.find("#minifier");
    $GP.mini = $("#minify");
    $GP.info = $("#attributepane");
    $GP.info_donnees = $GP.info.find(".nodeattributes");
    $GP.info_name = $GP.info.find(".name");
    $GP.info_link = $GP.info.find(".link");
    $GP.info_data = $GP.info.find(".data");
    $GP.info_close = $GP.info.find(".returntext");
    $GP.info_close2 = $GP.info.find(".close");
    $GP.info_p = $GP.info.find(".p");
    $GP.info_close.click(nodeNormal);
    $GP.info_close2.click(nodeNormal);
    $GP.form = $("#mainpanel").find("form");
    $GP.search = new Search($GP.form.find("#search"));
    // Add this after the $GP.search = new Search($GP.form.find("#search")); line
    if (config.features.search) {
        // Add search mode selector
        var searchModeSelector = $('<div class="search-mode-selector">' +
            '<span>Search by: </span>' +
            '<label><input type="radio" name="search-mode" value="both" checked> Both</label> ' +
            '<label><input type="radio" name="search-mode" value="name"> Name only</label> ' +
            '<label><input type="radio" name="search-mode" value="discipline"> Discipline only</label>' +
            '</div>');

        $GP.form.find("#search").after(searchModeSelector);

        // Add event handlers for the radio buttons
        searchModeSelector.find('input[type="radio"]').change(function() {
            $GP.search.setSearchMode($(this).val());
        });
    }
    if (!config.features.search) {
        $("#search").hide();
    }
    if (!config.features.groupSelectorAttribute) {
        $("#attributeselect").hide();
    }
    $GP.cluster = new Cluster($GP.form.find("#attributeselect"));
    config.GP = $GP;
    initSigma(config);
    
    // Add legend toggle button - positioned at bottom of mainpanel to avoid overlap
    if (config.features.legendToggle !== false) {
        const legendToggle = document.createElement('div');
        legendToggle.id = 'legend-toggle';
        legendToggle.textContent = 'Show Discipline Legend';
        legendToggle.style.position = 'fixed';
        legendToggle.style.bottom = '700px';
        legendToggle.style.right = '20px';
        legendToggle.style.padding = '8px 12px';
        legendToggle.style.backgroundColor = '#f5f5f5';
        legendToggle.style.border = '1px solid #ccc';
        legendToggle.style.borderRadius = '3px';
        legendToggle.style.cursor = 'pointer';
        legendToggle.style.zIndex = '1001'; // Higher than legend itself
        legendToggle.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';
        
        legendToggle.addEventListener('click', function() {
            const legend = document.getElementById('discipline-legend');
            if (legend && legend.style.display !== 'none') {
                hideDisciplineLegend();
            } else {
                showDisciplineLegend();
            }
        });
        
        document.body.appendChild(legendToggle);
    }
}

function configSigmaElements(config) {
    $GP = config.GP;

    // Node hover behaviour
    if (config.features.hoverBehavior == "dim") {

        var greyColor = '#ccc';
        sigInst.bind('overnodes', function(event) {
            var nodes = event.content;
            var neighbors = {};
            sigInst.iterEdges(function(e) {
                if (nodes.indexOf(e.source) < 0 && nodes.indexOf(e.target) < 0) {
                    if (!e.attr['grey']) {
                        e.attr['true_color'] = e.color;
                        e.color = greyColor;
                        e.attr['grey'] = 1;
                    }
                } else {
                    e.color = e.attr['grey'] ? e.attr['true_color'] : e.color;
                    e.attr['grey'] = 0;

                    neighbors[e.source] = 1;
                    neighbors[e.target] = 1;
                }
            }).iterNodes(function(n) {
                if (!neighbors[n.id]) {
                    if (!n.attr['grey']) {
                        n.attr['true_color'] = n.color;
                        n.color = greyColor;
                        n.attr['grey'] = 1;
                    }
                } else {
                    n.color = n.attr['grey'] ? n.attr['true_color'] : n.color;
                    n.attr['grey'] = 0;
                }
            }).draw(2, 2, 2);
        }).bind('outnodes', function() {
            sigInst.iterEdges(function(e) {
                e.color = e.attr['grey'] ? e.attr['true_color'] : e.color;
                e.attr['grey'] = 0;
            }).iterNodes(function(n) {
                n.color = n.attr['grey'] ? n.attr['true_color'] : n.color;
                n.attr['grey'] = 0;
            }).draw(2, 2, 2);
        });

    } else if (config.features.hoverBehavior == "hide") {

        sigInst.bind('overnodes', function(event) {
            var nodes = event.content;
            var neighbors = {};
            sigInst.iterEdges(function(e) {
                if (nodes.indexOf(e.source) >= 0 || nodes.indexOf(e.target) >= 0) {
                    neighbors[e.source] = 1;
                    neighbors[e.target] = 1;
                }
            }).iterNodes(function(n) {
                if (!neighbors[n.id]) {
                    n.hidden = 1;
                } else {
                    n.hidden = 0;
                }
            }).draw(2, 2, 2);
        }).bind('outnodes', function() {
            sigInst.iterEdges(function(e) {
                e.hidden = 0;
            }).iterNodes(function(n) {
                n.hidden = 0;
            }).draw(2, 2, 2);
        });

    }
    $GP.bg = $(sigInst._core.domElements.bg);
    $GP.bg2 = $(sigInst._core.domElements.bg2);
    var a = [],
        b, x = 1;
    for (b in sigInst.clusters) a.push('<div style="line-height:12px"><a href="#' + b + '"><div style="width:40px;height:12px;border:1px solid #fff;background:' + b + ';display:inline-block"></div> Group ' + (x++) + ' (' + sigInst.clusters[b].length + ' members)</a></div>');
    //a.sort();
    $GP.cluster.content(a.join(""));
    b = {
        minWidth: 400,
        maxWidth: 800,
        maxHeight: 600
    }; //        minHeight: 300,
    $("a.fb").fancybox(b);
    $("#zoom").find("div.z").each(function() {
        var a = $(this),
            b = a.attr("rel");
        a.click(function() {
            if (b == "center") {
                sigInst.position(0, 0, 1).draw();
            } else {
                var a = sigInst._core;
                sigInst.zoomTo(a.domElements.nodes.width / 2, a.domElements.nodes.height / 2, a.mousecaptor.ratio * ("in" == b ? 1.5 : 0.5));
            }

        })
    });
    $GP.mini.click(function() {
        $GP.mini.hide();
        $GP.intro.show();
        $GP.minifier.show()
    });
    $GP.minifier.click(function() {
        $GP.intro.hide();
        $GP.minifier.hide();
        $GP.mini.show()
    });
    $GP.intro.find("#showGroups").click(function() {
        !0 == $GP.showgroup ? showGroups(!1) : showGroups(!0)
    });
    a = window.location.hash.substr(1);
    if (0 < a.length) switch (a) {
        case "Groups":
            showGroups(!0);
            break;
        case "information":
            $.fancybox.open($("#information"), b);
            break;
        default:
            $GP.search.exactMatch = !0, $GP.search.search(a)
            $GP.search.clean();
    }

}

function Search(a) {
    this.input = a.find("input[name=search]");
    this.state = a.find(".state");
    this.results = a.find(".results");
    this.exactMatch = !1;
    this.lastSearch = "";
    this.searching = !1;
    this.searchMode = "both"; // Add this line - options are "name", "discipline", or "both"

    var self = this; // Changed from 'b' to 'self' to avoid naming conflicts
    this.input.focus(function() {
        var a = $(this);
        a.data("focus") || (a.data("focus", !0), a.removeClass("empty"));
        self.clean() // Changed from b to self
    });
    this.input.keydown(function(a) {
        if (13 == a.which) return self.state.addClass("searching"), self.search(self.input.val()), !1 // Changed from b to self
    });
    this.state.click(function() {
        var a = self.input.val(); // Changed from b to self
        self.searching && a == self.lastSearch ? self.close() : (self.state.addClass("searching"), self.search(a)) // Changed from b to self
    });
    this.dom = a;
    this.close = function() {
        this.state.removeClass("searching");
        this.results.hide();
        this.searching = !1;
        this.input.val(""); //SAH -- let's erase string when we close
        nodeNormal()
    };
    this.clean = function() {
        this.results.empty().hide();
        this.state.removeClass("searching");
        this.input.val("");
    };
    this.search = function(a) {
        var isMatch = !1,
            resultList = [],
            searchPattern = this.exactMatch ? ("^" + a + "$").toLowerCase() : a.toLowerCase(),
            g = RegExp(searchPattern);
        this.exactMatch = !1;
        this.searching = !0;
        this.lastSearch = a;
        this.results.empty();
        if (2 >= a.length) this.results.html("<i>You must search for a name with a minimum of 3 letters.</i>");
        else {
            var searchObj = this; // Store reference to the search object for use in callback
            sigInst.iterNodes(function(n) {
                // Check node label
                var matchLabel = g.test(n.label.toLowerCase());

                // Check discipline attribute
                var matchDiscipline = false;
                if (n.attr && n.attr.attributes && n.attr.attributes.disciplines) {
                    matchDiscipline = g.test(n.attr.attributes.disciplines.toLowerCase());
                }

                // Add to results based on search mode
                if ((searchObj.searchMode === "name" && matchLabel) ||
                    (searchObj.searchMode === "discipline" && matchDiscipline) ||
                    (searchObj.searchMode === "both" && (matchLabel || matchDiscipline))) {

                    // Get discipline to display in results
                    var discipline = n.attr && n.attr.attributes && n.attr.attributes.disciplines ?
                        n.attr.attributes.disciplines :
                        "unknown";

                    resultList.push({
                        id: n.id,
                        name: n.label,
                        discipline: discipline
                    });
                }
            });
            resultList.length ? (isMatch = !0, nodeActive(resultList[0].id)) : isMatch = showCluster(a);
            a = ["<b>Search Results: </b>"];
            if (1 < resultList.length)
                for (var d = 0, h = resultList.length; d < h; d++) {
                    a.push('<a href="#' + resultList[d].name + '" onclick="nodeActive(\'' + resultList[d].id +
                        "')\">" + resultList[d].name +
                        " <span style='color:#666;font-style:italic'>(" + resultList[d].discipline + ")</span></a>");
                }
            0 == resultList.length && !isMatch && a.push("<i>No results found.</i>");
            1 < a.length && this.results.html(a.join(""));
        }
        if (resultList.length != 1) this.results.show();
        if (resultList.length == 1) this.results.hide();
    };

    // Add new method to change search mode
    this.setSearchMode = function(mode) {
        if (["name", "discipline", "both"].includes(mode)) {
            this.searchMode = mode;
        }
    };
}

function Cluster(a) {
    this.cluster = a;
    this.display = !1;
    this.list = this.cluster.find(".list");
    this.list.empty();
    this.select = this.cluster.find(".select");
    this.select.click(function() {
        $GP.cluster.toggle()
    });
    this.toggle = function() {
        this.display ? this.hide() : this.show()
    };
    this.content = function(a) {
        this.list.html(a);
        this.list.find("a").click(function() {
            var a = $(this).attr("href").substr(1);
            showCluster(a)
        })
    };
    this.hide = function() {
        this.display = !1;
        this.list.hide();
        this.select.removeClass("close")
    };
    this.show = function() {
        this.display = !0;
        this.list.show();
        this.select.addClass("close")
    }
}

function showGroups(a) {
    a ? ($GP.intro.find("#showGroups").text("Hide groups"), $GP.bg.show(), $GP.bg2.hide(), $GP.showgroup = !0) : ($GP.intro.find("#showGroups").text("View Groups"), $GP.bg.hide(), $GP.bg2.show(), $GP.showgroup = !1)
}

function nodeNormal() {
    !0 != $GP.calculating && !1 != sigInst.detail && (showGroups(!1), $GP.calculating = !0, sigInst.detail = !0, $GP.info.delay(400).animate({ width: 'hide' }, 350), $GP.cluster.hide(), sigInst.iterEdges(function(a) {
        a.attr.color = !1;
        a.hidden = !1
    }), sigInst.iterNodes(function(a) {
        a.hidden = !1;
        a.attr.color = !1;
        a.attr.lineWidth = !1;
        a.attr.size = !1
    }), sigInst.draw(2, 2, 2, 2), sigInst.neighbors = {}, sigInst.active = !1, $GP.calculating = !1, window.location.hash = "")
}

function nodeActive(a) {
    // Hide the discipline legend when a node is activated
    hideDisciplineLegend();

    var groupByDirection = false;
    if (config.informationPanel.groupByEdgeDirection && config.informationPanel.groupByEdgeDirection == true) groupByDirection = true;

    sigInst.neighbors = {};
    sigInst.detail = !0;
    var b = sigInst._core.graph.nodesIndex[a];
    showGroups(!1);
    var outgoing = {},
        incoming = {},
        mutual = {}; //SAH
    sigInst.iterEdges(function(b) {
        b.attr.lineWidth = !1;
        b.hidden = !0;

        n = {
            name: b.label,
            colour: b.color
        };

        if (a == b.source) outgoing[b.target] = n; //SAH
        else if (a == b.target) incoming[b.source] = n; //SAH
        if (a == b.source || a == b.target) sigInst.neighbors[a == b.target ? b.source : b.target] = n;
        b.hidden = !1, b.attr.color = "rgba(0, 0, 0, 1)";
    });
    var f = [];
    sigInst.iterNodes(function(a) {
        a.hidden = !0;
        a.attr.lineWidth = !1;
        a.attr.color = a.color
    });

    if (groupByDirection) {
        //SAH - Compute intersection for mutual and remove these from incoming/outgoing
        for (e in outgoing) {
            //name=outgoing[e];
            if (e in incoming) {
                mutual[e] = outgoing[e];
                delete incoming[e];
                delete outgoing[e];
            }
        }
    }

    var createList = function(c) {
        var f = [];
        var e = [],
            //c = sigInst.neighbors,
            g;
        for (g in c) {
            var d = sigInst._core.graph.nodesIndex[g];
            d.hidden = !1;
            d.attr.lineWidth = !1;
            d.attr.color = c[g].colour;
            a != g && e.push({
                id: g,
                name: d.label,
                group: (c[g].name) ? c[g].name : "",
                colour: c[g].colour
            })
        }
        e.sort(function(a, b) {
            var c = a.group.toLowerCase(),
                d = b.group.toLowerCase(),
                e = a.name.toLowerCase(),
                f = b.name.toLowerCase();
            return c != d ? c < d ? -1 : c > d ? 1 : 0 : e < f ? -1 : e > f ? 1 : 0
        });
        d = "";
        for (g in e) {
            c = e[g];
            /*if (c.group != d) {
            	d = c.group;
            	f.push('<li class="cf" rel="' + c.color + '"><div class=""></div><div class="">' + d + "</div></li>");
            }*/
            f.push('<li class="membership"><a href="#' + c.name + '" onmouseover="sigInst._core.plotter.drawHoverNode(sigInst._core.graph.nodesIndex[\'' + c.id + '\'])\" onclick=\"nodeActive(\'' + c.id + '\')" onmouseout="sigInst.refresh()">' + c.name + "</a></li>");
        }
        return f;
    }

    /*console.log("mutual:");
    console.log(mutual);
    console.log("incoming:");
    console.log(incoming);
    console.log("outgoing:");
    console.log(outgoing);*/


    var f = [];

    //console.log("neighbors:");
    //console.log(sigInst.neighbors);

    if (groupByDirection) {
        size = Object.size(mutual);
        f.push("<h2>Mututal (" + size + ")</h2>");
        (size > 0) ? f = f.concat(createList(mutual)): f.push("No mutual links<br>");
        size = Object.size(incoming);
        f.push("<h2>Incoming (" + size + ")</h2>");
        (size > 0) ? f = f.concat(createList(incoming)): f.push("No incoming links<br>");
        size = Object.size(outgoing);
        f.push("<h2>Outgoing (" + size + ")</h2>");
        (size > 0) ? f = f.concat(createList(outgoing)): f.push("No outgoing links<br>");
    } else {
        f = f.concat(createList(sigInst.neighbors));
    }
    //b is object of active node -- SAH
    b.hidden = !1;
    b.attr.color = b.color;
    b.attr.lineWidth = 6;
    b.attr.strokeStyle = "#000000";
    sigInst.draw(2, 2, 2, 2);

    $GP.info_link.find("ul").html(f.join(""));
    $GP.info_link.find("li").each(function() {
        var a = $(this),
            b = a.attr("rel");
    });
    f = b.attr;
    if (f.attributes) {
        var image_attribute = false;
        if (config.informationPanel.imageAttribute) {
            image_attribute = config.informationPanel.imageAttribute;
        }
        e = [];
        temp_array = [];
        g = 0;
        for (var attr in f.attributes) {
            var d = f.attributes[attr],
                h = "";
            if (attr != image_attribute) {
                h = '<span><strong>' + attr + ':</strong> ' + d + '</span><br/>'
            }
            //temp_array.push(f.attributes[g].attr);
            e.push(h)
        }

        if (image_attribute) {
            //image_index = jQuery.inArray(image_attribute, temp_array);
            $GP.info_name.html("<div><img src=" + f.attributes[image_attribute] + " style=\"vertical-align:middle\" /> <span onmouseover=\"sigInst._core.plotter.drawHoverNode(sigInst._core.graph.nodesIndex['" + b.id + '\'])" onmouseout="sigInst.refresh()">' + b.label + "</span></div>");
        } else {
            $GP.info_name.html("<div><span onmouseover=\"sigInst._core.plotter.drawHoverNode(sigInst._core.graph.nodesIndex['" + b.id + '\'])" onmouseout="sigInst.refresh()">' + b.label + "</span></div>");
        }
        // Image field for attribute pane
        $GP.info_data.html(e.join("<br/>"))
    }
    $GP.info_data.show();
    $GP.info_p.html("Connections:");
    $GP.info.animate({ width: 'show' }, 350);
    $GP.info_donnees.hide();
    $GP.info_donnees.show();
    sigInst.active = a;
    window.location.hash = b.label;
}

function showCluster(a) {
    // Hide the discipline legend when a cluster is shown
    hideDisciplineLegend();
    
    var b = sigInst.clusters[a];
    if (b && 0 < b.length) {
        showGroups(!1);
        sigInst.detail = !0;
        b.sort();
        sigInst.iterEdges(function(a) {
            a.hidden = !1;
            a.attr.lineWidth = !1;
            a.attr.color = !1
        });
        sigInst.iterNodes(function(a) {
            a.hidden = !0
        });
        for (var f = [], e = [], c = 0, g = b.length; c < g; c++) {
            var d = sigInst._core.graph.nodesIndex[b[c]];
            !0 == d.hidden && (e.push(b[c]), d.hidden = !1, d.attr.lineWidth = !1, d.attr.color = d.color, f.push('<li class="membership"><a href="#' + d.label + '" onmouseover="sigInst._core.plotter.drawHoverNode(sigInst._core.graph.nodesIndex[\'' + d.id + "'])\" onclick=\"nodeActive('" + d.id + '\')" onmouseout="sigInst.refresh()">' + d.label + "</a></li>"))
        }
        sigInst.clusters[a] = e;
        sigInst.draw(2, 2, 2, 2);
        $GP.info_name.html("<b>" + a + "</b>");
        $GP.info_data.hide();
        $GP.info_p.html("Group Members:");
        $GP.info_link.find("ul").html(f.join(""));
        $GP.info.animate({ width: 'show' }, 350);
        $GP.search.clean();
        $GP.cluster.hide();
        return !0
    }
    return !1
}
