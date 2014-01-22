
var Samegame = function() {}

Samegame.prototype = {
	player: 'Anonymous',
	cookieName: 'anti_samegame_playername',
	colors: 5,
	tilesize: 36,
	width: 11,
	height: 11,
	matched: [],
	verified: [],
	e: {},
	ruleset: 'standard',

	rules: {
		'standard': {
			label: 'Standard',
			newlines: false,
			wind: false,
			width: 11,
			height: 12
		},
		'continuous': {
			label: 'Continuous',
			newlines: true,
			wind: false,
			width: 11,
			height: 11
		},
		'shifter': {
			label: 'Shifter',
			newlines: false,
			wind: true,
			width: 11,
			height: 12
		},
		'megashift': {
			label: 'MegaShift',
			newlines: true,
			wind: true,
			width: 11,
			height: 11
		}
	},

	setGridSize: function(w, h) {
		this.width = w;
		this.height = h;
		this.e.grid.css({
			width: w * this.tilesize,
			height: h * this.tilesize
		});
		return this;
	},

	randomize: function() {
		for (var i = 0; i < this.width * this.height; i++) {
			this.grid[i] = this.tileRandom();
		}
		return this;
	},

	spawn: function() {
		var frag = document.createDocumentFragment();
		for (var i = 0; i < this.width * this.height; i++) {
			var t = document.createElement('a');
			t.innerHTML = '<span></span>';
			frag.appendChild(t);
		}
		this.e.grid.empty()[0].appendChild(frag);
		this.e.tiles = this.e.grid.find('a').mouseover(function() {
			$t = $(this);
			game.search($t.index());
			return false;
		}).click(function() {
			if ($(this).hasClass('matched')) {
				game.destroy();
			}
		});
		return this;
	},

	colorize: function() {
		var c = this.e.grid.children();
		for (var i = 0; i < this.grid.length; i++) {
			c[i].className = 'c' + this.grid[i];
		}
	},

	resetSearch: function() {
		this.e.tiles.filter('.matched').removeClass('matched');
		this.matched = [];
		this.verified = [];
		this.updateScore();
	},

	search: function(x) {
		this.resetSearch();
		this.assimilate(x, this.grid[x]);

		if (this.matched.length < 2) {
			this.resetSearch();
		} else {
			for (var i in this.matched) {
				this.e.tiles.eq(this.matched[i]).addClass('matched');
				x++;
			}
			var x = this.matched.length;
			var points = x * (x - 1);
			this.e.game.find('#score').html('Score: ' + this.score + '+' + points);
		}
	},

	checkMoves: function() {
		this.resetSearch();
		for (var y = 0; y < this.width; y++) {
			for (var x = 0; x < this.height; x++) {
				var i = y * this.width + x;
				if (this.grid[i] > 0) {
					this.assimilate(i, this.grid[i]);
					if (this.matched.length > 1) {
						return true;
					} else {
						this.resetSearch();
					}
				}
			}
		}
		return false;
	},

	assimilate: function(xy, c) {
		this.verified.push(xy);
		if (this.grid[xy] == c) {
			this.matched.push(xy);

			var x = xy % this.width;
			var y = Math.floor(xy / this.width);

			var n = {
				tn: y > 0 ? xy - this.width : null,
				ts: y < this.height - 1 ? xy + this.width : null,
				tw: x > 0 ? xy - 1 : null,
				te: x < this.width - 1 ? xy + 1 : null
			};

			for (var i in n) {
				if (n[i] !== null && this.verified.indexOf(n[i]) == -1) {
					this.assimilate(n[i], c);
				}
			}
		}
	},

	destroy: function() {
		var x = this.matched.length;
		if (x) {
			this.moves++;
			for (var i in this.matched) this.grid[this.matched[i]] = 0;
			this.packRows().packColumns().newLines().shiftRight().colorize();
			this.score += x * (x - 1);
			var movesleft = this.updateScore().checkMoves();
			if (!movesleft) this.gameover();
		}
	},

	packRows: function() {
		for (var x = 0; x < this.width; x++) {
			var column = [];
			for (var y = 0; y < this.height; y++) {
				var i = (this.height - 1 - y) * this.width + x;
				if (this.grid[i] != 0) column.push(this.grid[i]);
			}
			column = column.pad(this.height, 0);
			this.putColumn(x, column);
		}
		return this;
	},

	packColumns: function() {
		var again = false;

		var cols = [];
		for (var x = this.width - 1; x > -1; x--) {
			cols.push(this.isEmpty(x));
		}

		while (cols[cols.length - 1]) {
			cols.pop();
		}

		for (var o = 0; o < cols.length; o++) {
			var x = this.width - 1 - o;
			if (cols[o]) {
				again = true;
				for (var xx = x; xx > 0; xx--) this.putColumn(xx, this.getColumn(xx - 1));
				this.putColumn(0, this.makeColumn(this.height, this.tileEmpty));
				break;
			}
		}

		return again ? this.packColumns() : this;
	},

	newLines: function() {
		if (!this.rules[this.ruleset].newlines) return this;

		for (var x = this.width - 1; x > -1; x--) {
			if (this.isEmpty(x)) {
				this.putColumn(x, this.nextColumn.reverse());
				this.nextColumn = this.makeColumn(rand(1, this.height), this.tileRandom);
				this.updatePreview();
			}
		}

		return this;
	},

	shiftRight: function() {
		if (!this.rules[this.ruleset].wind) return this;


		for (var y = 0; y < this.height; y++) {
			var row = [];
			for (var x = 0; x < this.width; x++) {
				var i = y * this.width + x;
				if (this.grid[i] != 0) row.push(this.grid[i]);
			}
			row = row.pad(-this.width, 0);
			this.putRow(y, row);
		}

		return this;
	},

	makeColumn: function(length, generator) {
		var column = [];
		for (var y = 0; y < length; y++) column.push(generator.call(this));
		return column;
	},

	getColumn: function(x) {
		var column = [];
		for (var y = this.height - 1; y > -1; y--) column.push(this.grid[y * this.width + x]);
		return column;
	},

	putColumn: function(x, column) {
		for (var y = 0; y < column.length; y++) {
			this.grid[(this.height - 1 - y) * this.width + x] = column[y];
		}
		return this;
	},

	putRow: function(y, row) {
		for (var x = 0; x < this.width; x++) this.grid[y * this.width + x] = row[x];
		return this;
	},

	isEmpty: function(x) {
		var column = this.getColumn(x).unique();
		return column.length == 1 && column[0] == 0;
	},

	tileRandom: function() {
		return rand(1, this.colors);
	},

	tileEmpty: function() {
		return 0;
	},

	updatePreview: function() {
		var frag = document.createDocumentFragment();
		for (var x = 0; x < this.nextColumn.length; x++) {
			var $t = $('<a><span></span></a>').addClass('c' + this.nextColumn[x]);
			frag.appendChild($t[0]);
		}
		this.e.preview.empty()[0].appendChild(frag);
		return this;
	},

	updateScore: function() {
		this.e.game.find('#score').html('Score: ' + this.score);
		return this;
	},

	gameover: function() {
		this.e.game.hide();
		var $s = $('#submit').show();
		var c = $.cookie(this.cookieName);
		$s.find('input').val(c ? c : 'Anonymous').focus().select().end().find('em').html(this.score);
	},

	submitScore:function() {
		this.player = $('#playername').val();
		$.cookie(this.cookieName, this.player);

		$.ajax({
			type: 'POST',
			url: 'score.php',
			data: {
				op: 'set',
				colors: this.colors,
				moves: this.moves,
				playername: this.player,
				ruleset: this.ruleset,
				score: this.score
			},
			success: function(data) {
				$('#submit').hide();
				ui.loadScores();
			}
		});
	},

	reset: function() {
		this.moves = 0;
		this.score = 0;
		this.grid = [];

		this.e.mode.html(this.rules[this.ruleset].label);
		this.e.preview.toggle(this.rules[this.ruleset].newlines);
		this.setGridSize(this.width, this.height).randomize().spawn().colorize();
		this.e.grid.parent().center().show();

		if (this.rules[this.ruleset].newlines) {
			this.nextColumn = this.makeColumn(rand(1, this.height), this.tileRandom);
			this.updatePreview();
		}

		return this;
	},

	switchMode: function(ruleset) {
		$.cookie('anti_samegame_ruleset', ruleset);
		$('#scoreboard select').val(ruleset);
		this.ruleset = ruleset;
		var rules = this.rules[this.ruleset];
		this.width = rules.width;
		this.height = rules.height;

		return this;
	},

	newGame: function() {
		this.reset();
	},

	init: function() {
		this.startTime = new Date().getTime() / 1000;

		this.e = {
			game: $('#game'),
			grid: $('#grid'),
			mode: $('#mode'),
			preview: $('#preview'),
			submit: $('#submit'),
			tiles: null
		};

		var c = $.cookie('anti_samegame_ruleset');
		if (c) this.ruleset = c;
		this.switchMode(this.ruleset);

		var ref = this;

		this.e.grid.dblclick(function() {
			return false;
		});

		$(document).click(function() {
			ref.resetSearch();
		});

		this.e.submit.find('input').keyup(function(e) {
			if (e.which == 13) {
				ref.submitScore();
			}
		}).end().find('a[rel]').click(function() {
			ref.submitScore();
			return false;
		});

	}
}


var SamegameUI = function() {}
SamegameUI.prototype = {
	scorepage: 0,
	maxpage: 9,
	ruleset: '',
	request: null,
	e: {},

	loadScores: function() {
		var ref = this;
		$('a.score.prev').toggleClass('disabled', this.scorepage == 0);
		$('a.score.next').toggleClass('disabled', this.scorepage >= this.maxpage);
		this.ruleset = $('#scoreboard select').val();

		if (this.request) this.request.abort();

		this.request = $.ajax({
			type: 'POST',
			url: 'score.php',
			dataType: 'json',
			data: {
				op: 'get',
				page: this.scorepage,
				ruleset: this.ruleset
			},
			success: function(data) {
				var frag = document.createDocumentFragment();
				var dummy = {
					playername: '',
					score: ''
				};
				for (var i = 0; i < 10; i++) {
					var r = dummy;
					if (data[i]) r = data[i];
					var $t = $('<article><strong>' + (ref.scorepage * 10 + i + 1) + '</strong><b>' + r.playername + '</b><i>' + r.score + '</i></article>');
					frag.appendChild($t[0]);
				}
				ref.e.list.empty()[0].appendChild(frag);
				$('#scoreboard').center().show();
			}
		});
	},

	init: function() {
		this.ruleset = $('#scoreboard select').val();

		var r = $.cookie('anti_samegame_ruleset');
		if (!r) r = 'continuous';
		$('#options a[rel~=ruleset]').filter('[rel~=' + r + ']').addClass('active');
		$('#scoreboard select').val(r);

		this.e.list = $('#scoreboard .scorelist');
		var ref = this;
		$('#scoreboard select').change(function() {
			ref.ruleset = $(this).val();
			$(this).blur();
			ref.scorepage = 0;
			ref.loadScores();
		});

		$('a.score').click(function() {
			var rel = $(this).attr('class').split(' ')[1];
			var offs = rel == 'next' ? 1 : -1;
			if (ref.scorepage + offs >= 0 && ref.scorepage + offs <= ref.maxpage) {
				ref.scorepage += offs;
				ref.loadScores();
			}
		});
	}
}

var game,ui;
$(document).ready(function() {
	ui = new SamegameUI;
	game = new Samegame;
	game.init();
	ui.init();

	$('section').center();
	$('#menu').show();

	var em = unescape('%6C%79%73%61%6E%64%65%72%67%72%61%79%40%67%6D%61%69%6C%2E%63%6F%6D');
	$('#about a.em').attr('href', 'mailto:' + em);

	$('a[rel~=nav]').click(function() {
		$('section:visible').hide();
		$('#' + $(this).attr('rel').split(' ')[1]).show();
	});

	$('a[rel~=scoreboard]').click(function() {
		ui.loadScores();
	});

	$('#options a[rel~=ruleset]').click(function() {
		var rel = $(this).attr('rel').split(' ')[3];
		game.switchMode(rel);
	});

	$('a[rel~=new]').click(function() {
		game.newGame();
	});//.click();

});



time = function() {
	var x = new Date().getTime() / 1000;
	debug(x - game.startTime);
}

reset = function() {
	var x = new Date().getTime() / 1000;
	game.startTime = x;
}

debug = function(message) {
	if (typeof(console) != 'undefined') console.log(message);
};

function rand(from, to) {
	return from + Math.floor(Math.random() * (to - from + 1));
}

jQuery.fn.center = function() {
	return this.each(function() {
		$(this).css({
			'margin-left': -Math.floor($(this).outerWidth() / 2),
			'margin-top': -Math.floor($(this).outerHeight() / 2)
		});
	});
};

Array.prototype.pad = function(s, v) {
	var l = Math.abs(s) - this.length;
	var a = [].concat(this);
	if (l <= 0) return a;
	for (var i = 0; i < l; i++) s < 0 ? a.unshift(v) : a.push(v);
	return a;
};

Array.prototype.unique = function() {
	var a = [];
	var l = this.length;
	for (var i = 0; i < l; i++) {
		for (var j = i + 1; j < l; j++) if (this[i] === this[j]) j = ++i;
		a.push(this[i]);
	}
	return a;
};
