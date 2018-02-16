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

// var findANABABA = function (self) { return self[this.self.length - 1] == "i" ? (self + "nin Babası") : (self + "nın Babası") }


var findANABABA2 = function (self) {

    console.log("findANABABA2 -> " + self);
    
    if (self == "Kendisi") {
        return {
            Baba: "Babası",
            Anne: "Annesi"
        }
    }

    return {
        Baba: (self[self.length - 1] == "i") ? (self + "nin Babası") : (self + "nın Babası"),
        Anne: (self[self.length - 1] == "i") ? (self + "nin Annesi") : (self + "nın Annesi")
    }

}

var ID = "Sıra";
var YAKINLIK = "Yakınlık Derecesi"
var DOGUM_YERI_TARIHI = "Doğum Yeri ve Tarihi"
var NAME = "Adı"
var SURNAME = "Soyadı"

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

    var anaBaba = findANABABA2(yakinlik);
    if (anaBaba) {
        // var motherTree = getYakin(all, relation[yakinlik].Anne)
        // var fatherTree = getYakin(all, relation[yakinlik].Baba)


        var motherTree = getTree(all, anaBaba.Anne)
        var fatherTree = getTree(all, anaBaba.Baba)

        // if (typeof relation[yakinlik].Parent == "function" && relation[yakinlik].Parent().Anne) {
        //     motherTree = getTree(all, relation[yakinlik].Parent().Anne)
        //     fatherTree = getTree(all, relation[yakinlik].Parent().Baba)
        // }

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


