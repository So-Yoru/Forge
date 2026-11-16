const GERMAN_WORDS = [
  // A1 - Greetings & Basics (Levels 1-2)
  ["hallo", "hello"], ["tschüss", "bye"], ["danke", "thank you"], ["bitte", "please"],
  ["ja", "yes"], ["nein", "no"], ["guten Morgen", "good morning"], ["gute Nacht", "good night"],
  ["wie geht's", "how are you"], ["mir geht es gut", "I am fine"], ["auf Wiedersehen", "goodbye"],
  
  // A1 - Numbers
  ["eins", "one"], ["zwei", "two"], ["drei", "three"], ["vier", "four"], ["fünf", "five"],
  ["sechs", "six"], ["sieben", "seven"], ["acht", "eight"], ["neun", "nine"], ["zehn", "ten"],
  ["elf", "eleven"], ["zwölf", "twelve"], ["zwanzig", "twenty"], ["hundert", "hundred"],

  // A1 - Family
  ["die Mutter", "the mother"], ["der Vater", "the father"], ["die Schwester", "the sister"],
  ["der Bruder", "the brother"], ["das Kind", "the child"], ["die Familie", "the family"],
  ["die Oma", "the grandma"], ["der Opa", "the grandpa"], ["die Eltern", "the parents"],

  // A1 - Food & Drink
  ["das Wasser", "the water"], ["das Brot", "the bread"], ["der Apfel", "the apple"],
  ["die Milch", "the milk"], ["der Käse", "the cheese"], ["das Fleisch", "the meat"],
  ["der Kaffee", "the coffee"], ["der Tee", "the tea"], ["das Bier", "the beer"],
  ["der Wein", "the wine"], ["das Ei", "the egg"], ["die Suppe", "the soup"],
  ["der Reis", "the rice"], ["der Zucker", "the sugar"], ["das Salz", "the salt"],
  ["der Fisch", "the fish"], ["das Obst", "the fruit"], ["das Gemüse", "the vegetable"],

  // A1 - Animals
  ["der Hund", "the dog"], ["die Katze", "the cat"], ["der Vogel", "the bird"],
  ["das Pferd", "the horse"], ["die Maus", "the mouse"], ["die Kuh", "the cow"],
  ["das Schwein", "the pig"], ["der Bär", "the bear"],

  // A1 - Colors
  ["rot", "red"], ["blau", "blue"], ["grün", "green"], ["gelb", "yellow"],
  ["schwarz", "black"], ["weiß", "white"], ["grau", "grey"], ["braun", "brown"],

  // A1 - Verbs
  ["essen", "to eat"], ["trinken", "to drink"], ["gehen", "to go"], ["kommen", "to come"],
  ["sehen", "to see"], ["sprechen", "to speak"], ["lernen", "to learn"], ["arbeiten", "to work"],
  ["schlafen", "to sleep"], ["lesen", "to read"], ["schreiben", "to write"], ["kaufen", "to buy"],
  ["spielen", "to play"], ["hören", "to hear"], ["machen", "to do"], ["wohnen", "to live"],

  // A1 - Places & Objects
  ["das Haus", "the house"], ["die Schule", "the school"], ["der Bahnhof", "the train station"],
  ["die Stadt", "the city"], ["das Buch", "the book"], ["der Tisch", "the table"],
  ["der Stuhl", "the chair"], ["das Auto", "the car"], ["die Tür", "the door"],
  ["das Fenster", "the window"], ["das Handy", "the mobile phone"], ["der Computer", "the computer"],
  ["die Straße", "the street"], ["der Garten", "the garden"], ["das Zimmer", "the room"],

  // A2 - Adjectives
  ["groß", "big"], ["klein", "small"], ["gut", "good"], ["schlecht", "bad"],
  ["schnell", "fast"], ["langsam", "slow"], ["heiß", "hot"], ["kalt", "cold"],
  ["neu", "new"], ["alt", "old"], ["schön", "beautiful"], ["hässlich", "ugly"],
  ["teuer", "expensive"], ["billig", "cheap"], ["leicht", "easy"], ["schwer", "difficult"],
  
  // A2 - Time & Weather
  ["heute", "today"], ["morgen", "tomorrow"], ["gestern", "yesterday"], ["jetzt", "now"],
  ["immer", "always"], ["nie", "never"], ["oft", "often"], ["manchmal", "sometimes"],
  ["die Sonne", "the sun"], ["der Regen", "the rain"], ["der Schnee", "the snow"], ["der Wind", "the wind"]
];

const GERMAN_SENTENCES = [
  // Fill in the blanks (Level 3+)
  { de: "Ich trinke ___", en: "I drink water", blank: "Wasser", type: "fill" },
  { de: "Der ___ ist klein", en: "The dog is small", blank: "Hund", type: "fill" },
  { de: "Das ___ ist rot", en: "The house is red", blank: "Haus", type: "fill" },
  { de: "Ich esse einen ___", en: "I eat an apple", blank: "Apfel", type: "fill" },
  { de: "Wir lernen in der ___", en: "We learn in the school", blank: "Schule", type: "fill" },
  { de: "Er ist mein ___", en: "He is my brother", blank: "Bruder", type: "fill" },
  { de: "Sie trinkt ___", en: "She drinks coffee", blank: "Kaffee", type: "fill" },
  { de: "Das ___ ist weiß", en: "The milk is white", blank: "Milch", type: "fill" },
  { de: "Der ___ ist schnell", en: "The car is fast", blank: "Auto", type: "fill" },
  { de: "Ich lese ein ___", en: "I read a book", blank: "Buch", type: "fill" },
  { de: "Die ___ ist kalt", en: "The water is cold", blank: "Wasser", type: "fill" },
  { de: "Er spielt mit dem ___", en: "He plays with the dog", blank: "Hund", type: "fill" },
  
  // Full Translations (Level 5+)
  { de: "Ich lerne Deutsch", en: "I am learning German", type: "translate" },
  { de: "Der Mann trinkt Kaffee", en: "The man drinks coffee", type: "translate" },
  { de: "Die Frau isst Brot", en: "The woman eats bread", type: "translate" },
  { de: "Das Kind spielt im Haus", en: "The child plays in the house", type: "translate" },
  { de: "Wir gehen zum Bahnhof", en: "We go to the train station", type: "translate" },
  { de: "Die Katze ist schwarz", en: "The cat is black", type: "translate" },
  { de: "Ich habe einen Hund", en: "I have a dog", type: "translate" },
  { de: "Sie spricht sehr gut", en: "She speaks very well", type: "translate" },
  { de: "Das Auto ist teuer", en: "The car is expensive", type: "translate" },
  { de: "Wir lernen zusammen", en: "We learn together", type: "translate" },
  { de: "Er arbeitet in der Stadt", en: "He works in the city", type: "translate" },
  { de: "Ich mag diese Farbe", en: "I like this color", type: "translate" },
  { de: "Das Fenster ist offen", en: "The window is open", type: "translate" },
  { de: "Der Tisch ist groß", en: "The table is big", type: "translate" },
  { de: "Ich trinke jeden Morgen Tee", en: "I drink tea every morning", type: "translate" },
  { de: "Wo ist die Schule?", en: "Where is the school?", type: "translate" },
  { de: "Wie heißt du?", en: "What is your name?", type: "translate" },
  { de: "Ich komme aus Deutschland", en: "I come from Germany", type: "translate" },
  { de: "Er ist mein Vater", en: "He is my father", type: "translate" },
  { de: "Ich habe keine Zeit", en: "I have no time", type: "translate" }
];