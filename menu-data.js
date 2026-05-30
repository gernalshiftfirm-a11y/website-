/* ==========================================================
   Satija's Bakers & Cafe — shared shop + menu data
   Loaded by both index.html (marketing site) and pos.html (POS)
   ========================================================== */

window.SATIJA_SHOP = {
  name: "Satija's Bakers & Cafe",
  phone: '+919988799191',
  phoneDisplay: '+91 99887 99191',
  whatsapp: '919988799191',
  address: 'Sector-17, near Kidzee School, Guru Nanak Colony, Sangrur, Punjab 148001',
  addressShort: 'Sector-17, Guru Nanak Colony, Sangrur',
  timings: '8:00 AM – 9:00 PM',
  instagram: 'satija_bakers_and_cafe',
  rating: 4.8,
  reviewsCount: 150,
  gstin: '03ABCDE1234F1Z5',
  taxRate: 0.05,         // 5% GST split as CGST 2.5% + SGST 2.5%
};

window.SATIJA_ICONS = {
  Meals:        'fa-solid fa-utensils',
  Salads:       'fa-solid fa-leaf',
  Pizza:        'fa-solid fa-pizza-slice',
  Pasta:        'fa-solid fa-bowl-food',
  Burgers:      'fa-solid fa-burger',
  Sandwiches:   'fa-solid fa-bread-slice',
  Snacks:       'fa-solid fa-cookie-bite',
  Wraps:        'fa-solid fa-drumstick-bite',
  Desserts:     'fa-solid fa-ice-cream',
  Cakes:        'fa-solid fa-cake-candles',
  Pastries:     'fa-solid fa-stroopwafel',
  Drinks:       'fa-solid fa-mug-hot',
  Combos:       'fa-solid fa-box-archive',
  'Bento Cakes':'fa-solid fa-heart',
};

(function buildMenu() {
  const slug = s => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const M = (name, category, price, emoji, desc) =>
    ({ id: slug(name), name, category, price, emoji, desc, veg: true });

  window.SATIJA_MENU = [
    // ===== MEALS =====
    M('Aloo Tikki Burger Meal', 'Meals', 140, '🍔', 'Crispy aloo tikki burger, fries & a chilled drink.'),
    M('Aloo Tikki Spicy Burger Meal', 'Meals', 150, '🌶️', 'Spice-loaded aloo tikki burger with fries & drink.'),
    M('Nuggets Burger Meal', 'Meals', 185, '🍟', 'Veg nuggets burger paired with fries & soft drink.'),
    M('Veggie Burger Meal', 'Meals', 160, '🥬', 'Garden-fresh veggie patty meal with fries & drink.'),
    M('Veggie Ginger Burger Meal', 'Meals', 175, '🫚', 'Ginger-spiced veggie patty meal with fries & drink.'),
    M('Paneer Ginger Burger Meal', 'Meals', 195, '🧀', 'Tandoori paneer & ginger burger with fries & drink.'),
    M('Satija Special Burger Meal', 'Meals', 210, '👑', "Our signature loaded burger meal — chef's pick."),

    // ===== SALADS =====
    M('American Veggie Salad', 'Salads', 120, '🥗', 'Crunchy greens, corn & tangy American dressing.'),
    M('Manchurian Veg Salad', 'Salads', 135, '🥢', 'Indo-Chinese veg manchurian over a fresh salad bed.'),
    M('Tandoori Paneer Salad', 'Salads', 160, '🔥', 'Smoky tandoori paneer over a crunchy salad mix.'),
    M('Shammi Kebab Veg Salad', 'Salads', 145, '🌿', 'Hand-rolled veg shammi kebabs with fresh greens.'),

    // ===== PIZZA =====
    M('Onion Corn Pizza', 'Pizza', 120, '🍕', 'Classic onion & corn on stretchy mozzarella base.'),
    M('Tomato Corn Pizza', 'Pizza', 120, '🍅', 'Juicy tomato & sweet corn over melted cheese.'),
    M('Cheese Pizza', 'Pizza', 135, '🧀', 'Pure indulgence — extra cheese on a crisp base.'),
    M('Corn On Pizza', 'Pizza', 255, '🌽', 'Loaded with sweet corn, herbs & double cheese.'),
    M('Paneer Tikka Pizza', 'Pizza', 195, '🥘', 'Smoky paneer tikka chunks with capsicum & onion.'),
    M('Spicy Paneer Pizza', 'Pizza', 255, '🌶️', 'Fiery paneer pizza for spice lovers.'),
    M('Veg Overloaded Pizza', 'Pizza', 280, '🥦', 'Capsicum, corn, onion, paneer, jalapeños — all on one.'),
    M('Satija Special Pizza', 'Pizza', 310, '👑', "Our signature loaded pizza — the house favourite."),

    // ===== PASTA =====
    M('White Sauce Pasta', 'Pasta', 145, '🍝', 'Creamy béchamel pasta with herbs & cheese.'),
    M('Red Sauce Pasta', 'Pasta', 160, '🍅', 'Tomato-basil sauce pasta with Italian herbs.'),
    M('Mix Sauce Pasta', 'Pasta', 175, '🍲', 'Best of both — creamy & tangy in one bowl.'),
    M('Italian Red Sauce Pasta', 'Pasta', 200, '🇮🇹', 'Authentic Italian pomodoro pasta with parmesan.'),
    M('Italian White Sauce Pasta', 'Pasta', 200, '🥛', 'Authentic Italian alfredo with garlic & cream.'),
    M('Italian Mixed Sauce Pasta', 'Pasta', 200, '🍷', 'House Italian-style mix sauce pasta.'),

    // ===== BURGERS =====
    M('Aloo Tikki Burger', 'Burgers', 60, '🥔', 'Soft bun, hot crispy aloo tikki, mint mayo.'),
    M('Veggie Burger', 'Burgers', 80, '🥗', 'Crunchy mixed-veg patty with melt-in cheese.'),
    M('Paneer Ginger Burger', 'Burgers', 115, '🧀', 'Tandoori paneer & ginger patty for that zing.'),
    M('Satija Special Burger', 'Burgers', 130, '👑', "Stacked tall, signature sauce — our pride."),

    // ===== SANDWICHES =====
    M('Cold Sandwich', 'Sandwiches', 80, '🥪', 'Fresh, crunchy & light — a daytime favourite.'),
    M('Mixed Veg Grilled Sandwich', 'Sandwiches', 105, '🍞', 'Garden veggies grilled to golden perfection.'),
    M('Grilled Paneer Sandwich', 'Sandwiches', 120, '🧀', 'Spiced paneer grilled with capsicum & onion.'),
    M('Super Veg Sandwich', 'Sandwiches', 145, '🥬', 'Triple-decker loaded with veggies & cheese.'),
    M('American Veggie Sub Sandwich', 'Sandwiches', 135, '🌭', 'Sub-style roll with veggies & house dressing.'),
    M('Tandoori Paneer Sub Sandwich', 'Sandwiches', 175, '🔥', 'Smoky paneer sub with mint chutney drizzle.'),

    // ===== SNACKS =====
    M('Potato Balls', 'Snacks', 80, '🥔', 'Golden-fried cheesy potato pops — kid favourite.'),
    M('Momos', 'Snacks', 80, '🥟', 'Steamed veg momos with spicy red chutney.'),
    M('Veg Nuggets', 'Snacks', 120, '🍗', 'Crispy outside, soft inside — pop-able veg bites.'),
    M('Salted Fries', 'Snacks', 80, '🍟', 'Classic salted fries, crisp golden batches.'),
    M('Peri Peri Fries', 'Snacks', 100, '🌶️', 'Tangy peri-peri tossed fries for the soul.'),
    M('Loaded Cheesy Fries', 'Snacks', 135, '🧀', 'Cheddar, jalapeños & house sauce over fries.'),
    M('Stuffed Garlic Bread', 'Snacks', 120, '🍞', 'Garlic bread loaded with veggies & mozzarella.'),
    M('Paneer Garlic Bread', 'Snacks', 135, '🧀', 'Garlic bread stuffed with spiced paneer.'),
    M('Crispy Momos', 'Snacks', 105, '🥟', 'Pan-fried momos with spicy schezwan glaze.'),
    M('Spring Roll', 'Snacks', 110, '🥬', 'Crisp veg spring rolls with sweet-chilli dip.'),

    // ===== WRAPS =====
    M('Potato Wrap', 'Wraps', 95, '🥔', 'Crispy aloo tikki wrapped with mint & onion.'),
    M('Crispy Veg Wrap', 'Wraps', 110, '🥬', 'Mixed crunchy veggies in a soft wrap.'),
    M('Nuggets Wrap', 'Wraps', 120, '🍗', 'Veg nuggets, crisp lettuce, mayo — rolled up.'),
    M('Paneer & Cheesy Wrap', 'Wraps', 135, '🧀', 'Spiced paneer + cheese pull in every bite.'),
    M('Super Veg Wrap', 'Wraps', 150, '👑', 'Loaded veggies, paneer, cheese & house sauce.'),

    // ===== DESSERTS =====
    M('Red Velvet Butter Roll', 'Desserts', 40, '❤️', 'Soft red velvet sponge rolled with butter cream.'),
    M('Chocolate Butter Roll', 'Desserts', 40, '🍫', 'Cocoa sponge rolled with rich butter cream.'),
    M('Brownie', 'Desserts', 65, '🟫', 'Fudgy chocolate brownie — warm on request.'),
    M('Choco Lava', 'Desserts', 65, '🌋', 'Molten chocolate centre — pour & melt.'),

    // ===== CAKES =====
    M('Strawberry Cake', 'Cakes', 350, '🍓', 'Pillowy sponge with fresh cream & strawberries (½ kg).'),
    M('Pineapple Cake', 'Cakes', 350, '🍍', 'Classic pineapple cream cake (½ kg).'),
    M('Butterscotch Cake', 'Cakes', 350, '🍯', 'Butterscotch crunch with caramel drizzle (½ kg).'),
    M('Blueberry Cake', 'Cakes', 350, '🫐', 'Soft sponge layered with blueberry compote (½ kg).'),
    M('Blackcurrant Cake', 'Cakes', 350, '🍇', 'Tangy blackcurrant cream layered cake (½ kg).'),
    M('Mango Cake', 'Cakes', 350, '🥭', 'Seasonal mango cream cake — alphonso bliss (½ kg).'),
    M('Red Velvet Cake', 'Cakes', 400, '❤️', 'Velvety red sponge with cream cheese (½ kg).'),
    M('Chocolate Cake', 'Cakes', 400, '🍫', 'Rich chocolate ganache layered cake (½ kg).'),
    M('Fruit Cake', 'Cakes', 475, '🍒', 'Loaded with seasonal fresh fruits (½ kg).'),
    M('Choco Chips Cake', 'Cakes', 475, '🍪', 'Chocolate cake studded with choco chips (½ kg).'),

    // ===== PASTRIES =====
    M('Pineapple Pastry', 'Pastries', 25, '🍍', 'Single-serve pineapple cream pastry.'),
    M('Chocolate Pastry', 'Pastries', 25, '🍫', 'Classic chocolate cream pastry.'),
    M('Red Velvet Pastry', 'Pastries', 35, '❤️', 'Single red-velvet slice with cream cheese.'),
    M('Black Forest Pastry', 'Pastries', 35, '🍒', 'Dark chocolate, cherries & whipped cream.'),
    M('Truffle Pastry', 'Pastries', 65, '🍫', 'Premium dark truffle ganache pastry.'),
    M('Choco Mousse Pastry', 'Pastries', 65, '🍮', 'Airy chocolate mousse on a sponge base.'),

    // ===== DRINKS =====
    M('Cold Coffee', 'Drinks', 120, '☕', 'Frothy iced coffee with vanilla scoop.'),
    M('Oreo Shake', 'Drinks', 120, '🍪', 'Crushed Oreos blended into thick milkshake.'),
    M('Brownie Shake', 'Drinks', 135, '🟫', 'Fudge brownie chunks in a creamy shake.'),
    M('KitKat Shake', 'Drinks', 145, '🍫', 'KitKat crunch swirled into a thick shake.'),
    M('Lemonade', 'Drinks', 105, '🍋', 'Fresh lime, mint & a splash of soda.'),
    M('Watermelon Mocktail', 'Drinks', 105, '🍉', 'Chilled watermelon mocktail with mint.'),
    M('Blue Lagoon Mojito', 'Drinks', 105, '💙', 'Blue curaçao styled refreshing mocktail.'),
    M('Mint Mojito', 'Drinks', 120, '🌿', 'Crushed mint, lime, soda — pure refreshment.'),

    // ===== COMBOS =====
    M('Pizza Combo', 'Combos', 850, '🍕', 'Large pizza + sides + drinks for the whole gang.'),
    M('Pasta Combo', 'Combos', 500, '🍝', 'Pasta + garlic bread + drinks combo.'),
    M('Sandwich Combo', 'Combos', 440, '🥪', 'Sandwich + fries + drinks combo.'),
    M('Garlic Bread Combo', 'Combos', 300, '🍞', 'Garlic bread duo + dip + drinks.'),
    M('Snack Combo', 'Combos', 460, '🍟', 'Mixed snack platter + dips + drinks.'),
    M('Wrap Combo', 'Combos', 360, '🌯', 'Wrap + fries + drink combo.'),
    M('Couple Combo 1', 'Combos', 240, '💑', 'For two — burger pair + fries + drinks.'),
    M('Couple Combo 2', 'Combos', 240, '💑', 'For two — wrap pair + fries + drinks.'),
    M('Couple Combo 3', 'Combos', 479, '💕', 'Premium duo combo with snacks & shakes.'),
    M('Family Combo 1', 'Combos', 335, '👨‍👩‍👧', 'Family of 4 — meals + sides.'),
    M('Family Combo 2', 'Combos', 350, '👨‍👩‍👧‍👦', 'Family of 4 — pizza + sides + drinks.'),
    M('Family Combo 3', 'Combos', 430, '🎉', 'Family feast with mixed favourites.'),

    // ===== BENTO / SPECIAL CAKES =====
    M('Bento Cake 150G', 'Bento Cakes', 245, '🎁', 'Mini personalised bento cake — 150 g (perfect gift).'),
    M('Bento Cake 250G', 'Bento Cakes', 295, '💝', 'Personalised bento cake — 250 g.'),
    M('Matki Cake 500G', 'Bento Cakes', 350, '🏺', 'Traditional matki (pot) style cake — 500 g.'),
  ];
})();
