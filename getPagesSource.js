var chart_config = {
    chart: {
        container: "#family-tree",
        connectors: {
            type: 'curve'
        },
        node: {
            HTMLclass: 'node'
        }
    },
    nodeStructure: {}
};

function arrayify(collection) {
    return Array.prototype.slice.call(collection);
}

function factory(headings) {
    return function (row) {
        return arrayify(row.cells).reduce(function (prev, curr, i) {
            prev[headings[i]] = curr.innerText.replace(/(\r\n|\n|\r)/gm, " ");
            return prev;
        }, {});
    }
}

function parseTable(table) {
    var headings = arrayify(table.tHead.rows[0].cells).map(function (heading) {
        return heading.innerText;
    });
    return arrayify(table.tBodies[0].rows).map(factory(headings));
}

var findANABABA = function(self){return self[this.self.length - 1] == "i" ?  (self + "nin Babası") : (self + "nın Babası")}

var ID = "Sıra";
var YAKINLIK = "Yakınlık Derecesi"
var DOGUM_YERI_TARIHI = "Doğum Yeri ve Tarihi"
var NAME = "Adı"
var SURNAME = "Soyadı"
var relation = {
    "Kendisi": {
        Baba: "Babası",//ok
        Anne: "Annesi"//ok
    },
    "Babası": {
        Baba: "Babasının Babası",//ok
        Anne: "Babasının Annesi"//ok
    },
    "Babasının Babası": {
        Baba: "Babasının Babasının Babası",//ok
        Anne: "Babasının Babasının Annesi"//ok
    },
    "Babasının Annesi": {
        Baba: "Babasının Annesinin Babası",//ok
        Anne: "Babasının Annesinin Annesi"//ok
    }
    ,
    "Babasının Babasının Babası": {
        Baba: "Babasının Babasının Babasının Babası",//ok
        Anne: "Babasının Babasının Babasının Annesi"//ok
    },
    "Babasının Babasının Annesi": {
        Baba: "Babasının Babasının Annesinin Babası",
        Anne: "Babasının Babasının Annesinin Annesi"
    }
    ,
    "Babasının Annesinin Babası": {
        Baba: "Babasının Annesinin Babasının Babası",
        Anne: "Babasının Annesinin Babasının Annesi"
    },
    "Babasının Annesinin Annesi": {
        Baba: "Babasının Annesinin Annesinin Babası",
        Anne: "Babasının Annesinin Annesinin Annesi"
    },

    //EN ALT
    "Babasının Babasının Babasının Babası": {
        self : "Babasının Babasının Babasının Babası",
        Baba : function(){return findANABABA(this.self)},
        Anne : function(){return findANABABA(this.self)},
    },
    "Babasının Babasının Babasının Annesi": {
        self : "Babasının Babasının Babasının Annesi",
        Baba : function(){return findANABABA(this.self)},
        Anne : function(){return findANABABA(this.self)},
    },
    "Babasının Babasının Annesinin Babası": {
        self : "Babasının Babasının Annesinin Babası",
        Baba : function(){return findANABABA(this.self)},
        Anne : function(){return findANABABA(this.self)},
    },
    "Babasının Babasının Annesinin Annesi": {
        self : "Babasının Babasının Annesinin Annesi",
        Baba : function(){return findANABABA(this.self)},
        Anne : function(){return findANABABA(this.self)},
    },

    "Annesi": {
        Baba: "Annesinin Babası",//ok
        Anne: "Annesinin Annesi"//ok
    },
    "Annesinin Babası": {
        Baba: "Annesinin Babasının Babası",//ok
        Anne: "Annesinin Babasının Annesi"//ok
    },
    "Annesinin Annesi": {
        Baba: "Annesinin Annesinin Babası",//ok
        Anne: "Annesinin Annesinin Annesi"//ok
    }
    ,
    "Annesinin Babasının Babası": {
        Baba: "Annesinin Babasının Babasının Babası",
        Anne: "Annesinin Babasının Babasının Annesi"
    },
    "Annesinin Babasının Annesi": {
        Baba: "Annesinin Babasının Annesinin Babası",
        Anne: "Annesinin Babasının Annesinin Annesi"
    }
    ,
    "Annesinin Annesinin Babası": {
        Baba: "Annesinin Annesinin Babasının Babası",
        Anne: "Annesinin Annesinin Babasının Annesi"
    },
    "Annesinin Annesinin Annesi": {
        Baba: "Annesinin Annesinin Annesinin Babası",
        Anne: "Annesinin Annesinin Annesinin Annesi"
    }
}

var getNodeStructure = function () {

    var table = document.querySelector(".resultTable");
    var data = parseTable(table);
    data = data.filter(function (item) {
        return item.Soyadı != undefined;
    });

    var id = data.length - 1;
    var nodeStructure = getTree(data, "Kendisi");

    return nodeStructure;
}

function getYakin(all, yakinlik) {
    for (var i = 0; i < all.length; i++) {
        if (all[i][YAKINLIK] == yakinlik)
            return all[i];
    }
    return null;
}

function getTree(all, yakinlik) {

    var yakin = getYakin(all, yakinlik);

    if (yakin == null)
        return null;

    var item = {
        text: {
            name: yakin[NAME] + " " + yakin[SURNAME],
            title: yakinlik,
            desc: yakin[DOGUM_YERI_TARIHI]
        },
        HTMLclass: yakin["C"] == "K" ? 'orange' : "yellow",
        image: yakin["C"] == "K" ? "img/woman.png" : "img/man.png",
        children: []
    }

    if (relation[yakinlik]) {
        // var motherTree = getYakin(all, relation[yakinlik].Anne)
        // var fatherTree = getYakin(all, relation[yakinlik].Baba)

        var motherTree = getTree(all, relation[yakinlik].Anne)
        var fatherTree = getTree(all, relation[yakinlik].Baba)

        if (motherTree != null)
            item.children.push(motherTree)
        if (fatherTree != null)
            item.children.push(fatherTree)
    }

    return item;
}


var tablink = document.URL;

if (tablink == "https://www.turkiye.gov.tr/nvi-alt-ust-soy-bilgisi-sorgulama") {

    if (document.querySelector(".resultTable")) {
        chart_config.nodeStructure = getNodeStructure();

        chrome.runtime.sendMessage({
            action: "getSource",
            source: JSON.stringify(chart_config)
        });

        console.log(chart_config)

    } else {
        chrome.runtime.sendMessage({
            action: "getSource",
            source: JSON.stringify({ error: "Sonuclar henuz yuklenmedi sanirim ?" })
        });
    }

} else {
    chrome.runtime.sendMessage({
        action: "getSource",
        source: JSON.stringify({ error: "Eklentinin çalışabilmesi için Alt-Üst Soy Bilgisi Sorgulama sayfası açılmalıdır." })
    });
}


