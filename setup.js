import { DatabaseSync } from "node:sqlite";
import { writeFileSync, readFileSync } from "node:fs";
import { nanoid } from "nanoid";

// New-Item data.db -ErrorAction SilentlyContinue
try { writeFileSync("data.db", "", { flag: 'ax' }) } catch { process.exit(0) }

const db = new DatabaseSync("data.db");
const dump = readFileSync("sqlite3_dump.sql", "utf-8");

db.exec(dump);

const authors = [
    {
        name: "Albert Einstein",
        quotes: [
            "Imagination is more important than knowledge.",
            "Life is like riding a bicycle. To keep your balance you must keep moving.",
            "A person who never made a mistake never tried anything new.",
            "The measure of intelligence is the ability to change.",
        ],
    },
    {
        name: "Mark Twain",
        quotes: [
            "The secret of getting ahead is getting started.",
            "If you tell the truth, you don't have to remember anything.",
            "Courage is resistance to fear, mastery of fear, not absence of fear.",
            "Never put off till tomorrow what may be done the day after tomorrow.",
        ],
    },
    {
        name: "Friedrich Nietzsche",
        quotes: [
            "That which does not kill us makes us stronger.",
            "Without music, life would be a mistake.",
            "He who has a why to live can bear almost any how.",
            "It is not a lack of love, but a lack of friendship that makes unhappy marriages.",
        ],
    },
    {
        name: "Socrates",
        quotes: [
            "The only true wisdom is in knowing you know nothing.",
            "An unexamined life is not worth living.",
            "Be kind, for everyone you meet is fighting a hard battle.",
            "Education is the kindling of a flame, not the filling of a vessel.",
        ],
    },
    {
        name: "Marcus Aurelius",
        quotes: [
            "You have power over your mind, not outside events. Realize this, and you will find strength.",
            "The impediment to action advances action. What stands in the way becomes the way.",
            "Waste no more time arguing about what a good man should be. Be one.",
            "If it is not right, do not do it; if it is not true, do not say it.",
        ],
    },
    {
        name: "Oscar Wilde",
        quotes: [
            "Be yourself; everyone else is already taken.",
            "We are all in the gutter, but some of us are looking at the stars.",
            "To live is the rarest thing in the world. Most people just exist.",
            "Always forgive your enemies; nothing annoys them so much.",
        ],
    },
    {
        name: "Maya Angelou",
        quotes: [
            "I've learned that people will forget what you said, people will forget what you did, but people will never forget how you made them feel.",
            "Nothing will work unless you do.",
            "Try to be a rainbow in someone else's cloud.",
            "We may encounter many defeats but we must not be defeated.",
        ],
    },
    {
        name: "Winston Churchill",
        quotes: [
            "Success is not final, failure is not fatal: it is the courage to continue that counts.",
            "If you're going through hell, keep going.",
            "We shape our buildings; thereafter they shape us.",
            "Attitude is a little thing that makes a big difference.",
        ],
    },
];

const insertAuthor = db.prepare(`INSERT INTO authors VALUES (?, ?)`);
const insertQuote  = db.prepare(`INSERT INTO quotes VALUES (?, ?, ?)`);

for (const { name, quotes } of authors) {
    const authorId = `author-${nanoid()}`;
    insertAuthor.run(authorId, name);

    for (const text of quotes) {
        const quoteId = `quote-${nanoid()}`;
        insertQuote.run(quoteId, authorId, text);
    }
}