//main.js for Appendix Arcana
$(function() {
	Parse.$ = jQuery;

	Parse.initialize(
		"IS4CnpowWqtiOMujVIZxUUItJRvDpqtPNtValXoM", // app id
		"clZJRbuIvarTk1SVx2AsoT9eU1pR4CHSelhhX2Mj" // js key
	);


	// ---------- Spell Model ----------

	// The Spell model has many prepopulated attributes and isn't meant to be edited.

	var SpellObject = Parse.Object.extend("SpellObject", {
		// Default attributes for the spell.
		defaults: {
			name: "MISSING NAME",
			known: false
			//since the database is populated, we better not need to set these.
		},

		// Ensure that each spell created has `name`.
		initialize: function() {
			if (!this.get("name")) {
				this.set({
					"name": this.defaults.name
				});
			}
		},

		// Toggle the `known` state of this spell item.
		toggle: function() {
			this.save({
				known: !this.get("known")
			});
		}
	});

	// This is the transient application state, not persisted on Parse
	var AppState = Parse.Object.extend("AppState", {
		defaults: {
			filter: "all"
		}
	});

	// ---------- Spell Collection ----------

	var SpellList = Parse.Collection.extend({

		// Reference to this collection's model.
		model: SpellObject,

		// Filter down the list of all spells that are known.
		known: function() {
			return this.filter(function(spell) {
				return spell.get('known');
			});
		},

		// Filter down the list to only unknown spells
		unknown: function() {
			return this.without.apply(this, this.known());
		},

		// We keep the Spells in sequential order, despite being saved by unordered GUID in the database. This generates the next order number for new items.
		nextOrder: function() {
			if (!this.length) return 1;
			return this.last().get('order') + 1;
		},

		// Spells are sorted by their original insertion order.
		comparator: function(spell) {
			return spell.get('order');
		}

	});

	// ---------- Spell Item View ----------

	// The DOM element for a spell item...
	var SpellView = Parse.View.extend({

		//... is a div tag.
		tagName: "div",

		// Cache the template function for a single item.
		template: _.template($('#spell-template').html()),

		// The DOM events specific to an item.
		events: {
			"click .toggle": "toggleKnown",
			//	"dblclick label.todo-content": "edit",
			"click .spell-destroy": "clear",
			//	"keypress .edit": "updateOnEnter",
			//	"blur .edit": "close"
		},

		// The SpellView listens for changes to its model, re-rendering. Since there's
		// a one-to-one correspondence between a Spell and a SpellView in this
		// app, we set a direct reference on the model for convenience.
		initialize: function() {
			_.bindAll(this, 'render', 'close', 'remove');
			this.model.bind('change', this.render);
			this.model.bind('destroy', this.remove);
		},

		// Re-render the contents of the spell item.
		render: function() {
			$(this.el).html(this.template(this.model.toJSON()));
			this.input = this.$('.edit');
			return this;
		},

		// Toggle the `"done"` state of the model.
		toggleKnown: function() {
			this.model.toggle();
		},

		// Switch this view into `"editing"` mode, displaying the input field.
		//edit: function() {
		//	$(this.el).addClass("editing");
		//	this.input.focus();
		//},

		// Close the `"editing"` mode, saving changes to the spell.
		//close: function() {
		//	this.model.save({
		//		content: this.input.val()
		//	});
		//	$(this.el).removeClass("editing");
		//},

		// If you hit `enter`, we're through editing the item.
		//updateOnEnter: function(e) {
		//	if (e.keyCode == 13) this.close();
		//},

		// Remove the item, destroy the model.
		clear: function() {
			this.model.destroy();
		}

	});

	// ---------- The Application ---------- 

	// The main view that lets a user manage their spell items
	var ManageSpellsView = Parse.View.extend({

		// Our template for the line of statistics at the bottom of the app.
		statsTemplate: _.template($('#stats-template').html()),

		// Delegated events for creating new items, and clearing completed ones.
		events: {
			//"keypress #new-spell":  "createOnEnter",
			//"click #clear-completed": "clearCompleted",
			"click #toggle-all": "toggleAllComplete",
			"click .log-out": "logOut",
			"click ul#filters a": "selectFilter"
		},

		el: ".content",

		// At initialization we bind to the relevant events on the `Spells`
		// collection, when items are added or changed. Kick things off by
		// loading any preexisting spells that might be saved to Parse.
		initialize: function() {
			var self = this;

			_.bindAll(this, 'addOne', 'addAll', 'addSome', 'render', 'toggleAllComplete', 'logOut', 'createOnEnter');

			// Main spell management template
			this.$el.html(_.template($("#manage-spells-template").html()));

			this.input = this.$("#new-spell");
			this.allCheckbox = this.$("#toggle-all")[0];

			// Create our collection of Spells
			this.spells = new SpellList();

			// Setup the query for the collection to look for spells from the current user
			this.spells.query = new Parse.Query(SpellObject);
			this.spells.query.equalTo("source", "APG");

			//this.spells.bind('add', this.addOne);
			//this.spells.bind('reset', this.addAll);
			//this.spells.bind('all', this.render);

			// Fetch all the spell items for this user
			console.log('fetching spells');
			this.spells.fetch();
			console.log('spells fetched');

			state.on("change", this.filter, this);
		},

		// Logs out the user and shows the login view
		logOut: function(e) {
			Parse.User.logOut();
			new LogInView();
			this.undelegateEvents();
			delete this;
		},

		// Re-rendering the App just means refreshing the statistics -- the rest
		// of the app doesn't change.
		render: function() {
			var known = this.spells.known().length;
			//var remaining = this.spells.remaining().length;

			this.$('#spell-stats').html(this.statsTemplate({
				total: this.spells.length,
				known: known
				  //remaining:  remaining
			}));

			this.delegateEvents();

			//this.allCheckbox.checked = !remaining;
		},

		// Filters the list based on which type of filter is selected
		selectFilter: function(e) {
			var el = $(e.target);
			var filterValue = el.attr("id");
			state.set({
				filter: filterValue
			});
			Parse.history.navigate(filterValue);
		},

		filter: function() {
			var filterValue = state.get("filter");
			this.$("ul#filters a").removeClass("selected");
			this.$("ul#filters a#" + filterValue).addClass("selected");
			if (filterValue === "all") {
				this.addAll();
			} else if (filterValue === "completed") {
				this.addSome(function(item) {
					return item.get('done')
				});
			} else {
				this.addSome(function(item) {
					return !item.get('done')
				});
			}
		},

		// Resets the filters to display all spells
		resetFilters: function() {
			this.$("ul#filters a").removeClass("selected");
			this.$("ul#filters a#all").addClass("selected");
			this.addAll();
		},

		// Add a single spell item to the list by creating a view for it, and
		// appending its element to the `<ul>`.
		addOne: function(spell) {
			var view = new SpellView({
				model: spell
			});
			this.$("#spell-list").append(view.render().el);
		},

		// Add all items in the Spells collection at once.
		addAll: function(collection, filter) {
			this.$("#spell-list").html("");
			this.spells.each(this.addOne);
		},

		// Only adds some spells, based on a filtering function that is passed in
		addSome: function(filter) {
			var self = this;
			this.$("#spell-list").html("");
			this.spells.chain().filter(filter).each(function(item) {
				self.addOne(item)
			});
		},

		// If you hit return in the main input field, create new Spell model
		createOnEnter: function(e) {
			var self = this;
			if (e.keyCode != 13) return;

			this.spells.create({
				content: this.input.val(),
				order: this.spells.nextOrder(),
				done: false,
				user: Parse.User.current(),
				ACL: new Parse.ACL(Parse.User.current())
			});

			this.input.val('');
			this.resetFilters();
		},

		// Clear all known spell items, destroying their models.
		clearCompleted: function() {
			_.each(this.spells.known(), function(spell) {
				spell.destroy();
			});
			return false;
		},

		toggleAllComplete: function() {
			var done = this.allCheckbox.checked;
			this.spells.each(function(spell) {
				spell.save({
					'known': known
				});
			});
		}
	});

	var LogInView = Parse.View.extend({
		events: {
			"submit form.login-form": "logIn",
			"submit form.signup-form": "signUp"
		},

		el: ".content",

		initialize: function() {
			_.bindAll(this, "logIn", "signUp");
			this.render();
		},

		logIn: function(e) {
			var self = this;
			var username = this.$("#login-username").val();
			var password = this.$("#login-password").val();

			Parse.User.logIn(username, password, {
				success: function(user) {
					new ManageSpellsView();
					self.undelegateEvents();
					delete self;
				},

				error: function(user, error) {
					self.$(".login-form .error").html("Invalid username or password. Please try again.").show();
					this.$(".login-form button").removeAttr("disabled");
				}
			});

			this.$(".login-form button").attr("disabled", "disabled");

			return false;
		},

		signUp: function(e) {
			var self = this;
			var username = this.$("#signup-username").val();
			var password = this.$("#signup-password").val();

			Parse.User.signUp(username, password, {
				ACL: new Parse.ACL()
			}, {
				success: function(user) {
					new ManageSpellsView();
					self.undelegateEvents();
					delete self;
				},

				error: function(user, error) {
					self.$(".signup-form .error").html(error.message).show();
					this.$(".signup-form button").removeAttr("disabled");
				}
			});

			this.$(".signup-form button").attr("disabled", "disabled");

			return false;
		},

		render: function() {
			this.$el.html(_.template($("#login-template").html()));
			this.delegateEvents();
		}
	});

	// The main view for the app
	var AppView = Parse.View.extend({
		// Instead of generating a new element, bind to the existing skeleton of
		// the App already present in the HTML.
		el: $("#main"),

		initialize: function() {
			this.render();
		},

		render: function() {
			if (Parse.User.current()) {
				new ManageSpellsView();
			} else {
				new LogInView();
			}
		}
	});

	var AppRouter = Parse.Router.extend({
		routes: {
			"all": "all",
			"active": "active",
			"completed": "completed"
		},

		initialize: function(options) {},

		all: function() {
			state.set({
				filter: "all"
			});
		},

		active: function() {
			state.set({
				filter: "active"
			});
		},

		completed: function() {
			state.set({
				filter: "completed"
			});
		}
	});

	var state = new AppState;

	new AppRouter;
	new AppView;
	Parse.history.start();

});