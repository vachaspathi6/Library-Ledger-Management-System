import * as SQLite from 'expo-sqlite';

export const openDatabaseAsync = async () => {
  const db = await SQLite.openDatabaseAsync('SchoolDB.db');
  return db;
};

export const initializeDatabase = async () => {
  const db = await openDatabaseAsync();

  // await db.execAsync(`
  //   PRAGMA foreign_keys = ON;
  //   PRAGMA journal_mode = WAL;

  //   -- Drop tables if they exist
  //   DROP TABLE IF EXISTS TransactionsCheckOut;
  //   DROP TABLE IF EXISTS TransactionsCheckIn;
  //   DROP TABLE IF EXISTS Students;
  //   DROP TABLE IF EXISTS Books;
  //   DROP TABLE IF EXISTS Stock;
  //   DROP TABLE IF EXISTS Teachers;

//     -- Create Teachers table with ProfilePicture as a URL (TEXT field)
//     CREATE TABLE IF NOT EXISTS Teachers (
//       TeacherID INTEGER PRIMARY KEY AUTOINCREMENT,
//       TeacherName TEXT NOT NULL,
//       SchoolID INTEGER,  -- Nullable to allow flexibility
//       Email TEXT NOT NULL,
//       Password TEXT NOT NULL,
//       ProfilePicture TEXT,  -- Store the image as a URL instead of binary data
//       ContactInfo TEXT,
//       Designation TEXT,
//       Qualifications TEXT,
//       DateOfBirth TEXT,  -- Can store in 'YYYY-MM-DD' format
//       Age INTEGER,  -- Nullable
//       Gender TEXT,  -- Nullable
//       JoinedDate TEXT,  -- Nullable, can store 'YYYY-MM-DD' format
//       Location TEXT,  -- Nullable
//       BloodGroup TEXT,
//       MartialStatus TEXT,
//       MotherTongue TEXT,
//       Nationality TEXT
//     );

//     -- Insert example data with profile picture URLs
//     INSERT INTO Teachers (
//       TeacherName, SchoolID, Email, Password, ProfilePicture, ContactInfo, Designation, 
//       Qualifications, DateOfBirth, Age, Gender, JoinedDate, Location, BloodGroup, 
//       MartialStatus, MotherTongue, Nationality
//     ) VALUES (
//       'Teacher1', 
//       1, 
//       'teacher1@example.com', 
//       'password1', 
//       'https://example.com/images/teacher1.jpg',  -- Profile picture as a URL
//       '123-456-7890', 
//       'Mathematics Teacher', 
//       'MSc in Mathematics', 
//       '1980-05-12', 
//       44,  -- Age
//       'Male',  -- Gender
//       '2020-01-15',  -- Joined Date
//       'New York, USA',  -- Location
//       'O+', 
//       'Married', 
//       'English', 
//       'American'
//     );

//     INSERT INTO Teachers (
//       TeacherName, SchoolID, Email, Password, ProfilePicture, ContactInfo, Designation, 
//       Qualifications, DateOfBirth, Age, Gender, JoinedDate, Location, BloodGroup, 
//       MartialStatus, MotherTongue, Nationality
//     ) VALUES (
//       'Teacher2', 
//       NULL,  -- SchoolID is nullable
//       'teacher2@example.com', 
//       'password2', 
//       NULL,  -- No profile picture uploaded yet
//       '987-654-3210', 
//       'Science Teacher', 
//       'BSc in Physics', 
//       '1985-08-22', 
//       39,  -- Age
//       'Female',  -- Gender
//       '2019-05-20',  -- Joined Date
//       'Toronto, Canada',  -- Location
//       'A-', 
//       'Single', 
//       'French', 
//       'Canadian'
//     );

//     INSERT INTO Teachers (
//       TeacherName, SchoolID, Email, Password, ProfilePicture, ContactInfo, Designation, 
//       Qualifications, DateOfBirth, Age, Gender, JoinedDate, Location, BloodGroup, 
//       MartialStatus, MotherTongue, Nationality
//     ) VALUES (
//       'Teacher3', 
//       3, 
//       'teacher3@example.com', 
//       'password3', 
//       'https://example.com/images/teacher3.jpg',  -- Another profile picture URL
//       '555-555-5555', 
//       'History Teacher', 
//       'PhD in History', 
//       '1975-03-30', 
//       49,  -- Age
//       'Male',  -- Gender
//       '2018-09-10',  -- Joined Date
//       'London, UK',  -- Location
//       'B+', 
//       'Divorced', 
//       'Spanish', 
//       'British'
//     );

   //    -- Create Books table
  //   CREATE TABLE IF NOT EXISTS Books (
  //     Book_ID INTEGER PRIMARY KEY AUTOINCREMENT,
  //     Book_Name TEXT NOT NULL,
  //     Level INTEGER NOT NULL,
  //     Language TEXT NOT NULL,
  //     Genres TEXT NOT NULL,
  //     ImageLink TEXT NOT NULL,
  //     Last_TID INTEGER NOT NULL,
  //     Available BOOLEAN DEFAULT 1
  //   );

  //   -- Insert data into Books table if empty (ensure unique Book_ID)
  // INSERT OR IGNORE INTO Books (Book_Name, Level, Language, Genres, Last_TID, ImageLink)
  // VALUES 
  //   ('Panchatantra', 1, 'Hindi', 'Fables, Classic', 101, 'https://m.media-amazon.com/images/I/81xqg04BTLL._AC_UF894,1000_QL80_.jpg'),
  //   ('Malgudi Days', 2, 'Kannada', 'Fiction, Drama', 102, 'https://upload.wikimedia.org/wikipedia/en/e/ea/DVD_Cover_of_Malgudi_Days.jpeg'),
  //   ('Chandamama', 3, 'Telugu', 'Fantasy, Adventure', 103, 'https://rukminim2.flixcart.com/image/850/1000/kxjav0w0/regionalbooks/z/y/4/chandamama-stories-1-english-book-multi-colour-original-imag9z78kgt6re32.jpeg?q=20&crop=false'),
  //   ('Aithihyamala', 4, 'Malayalam', 'Mythology, Classic', 104, 'https://m.media-amazon.com/images/I/71aXX8WI-1L._AC_UF1000,1000_QL80_.jpg'),
  //   ('Thirukkural', 5, 'Tamil', 'Ethics, Classic', 105, 'https://m.media-amazon.com/images/I/61XEdg1ka3S._AC_UF1000,1000_QL80_.jpg'),
  //   ('Pather Panchali', 6, 'Bengali', 'Drama, Classic', 106, 'https://m.media-amazon.com/images/I/81qR-aUxdiL._AC_UF1000,1000_QL80_.jpg'),
  //   ('Chandrakanta', 1, 'Hindi', 'Fantasy, Romance', 107, 'https://rukminim2.flixcart.com/image/850/1000/xif0q/book/r/k/7/chandrakanta-hindi-original-imagjyhbyzygpaxf.jpeg?q=90&crop=false'),
  //   ('Gitanjali', 2, 'Bengali', 'Poetry, Classic', 108, 'https://m.media-amazon.com/images/I/81gJA7cc3+L._AC_UF1000,1000_QL80_.jpg'),
  //   ('Shivaji The Great', 3, 'Marathi', 'Historical, Classic', 109, 'https://m.media-amazon.com/images/I/71NDa85qT7L._AC_UF1000,1000_QL80_.jpg'),
  //   ('Godaan', 4, 'Hindi', 'Drama, Classic', 110, 'https://rukminim2.flixcart.com/image/850/1000/xif0q/book/j/2/c/godan-hindi-classic-novel-original-imagpgp8zycrrrvw.jpeg?q=90&crop=false');
  

  //   -- Create Stock table
  //   CREATE TABLE IF NOT EXISTS Stock (
  //     Book_ID INTEGER PRIMARY KEY AUTOINCREMENT,
  //     Book_Name TEXT NOT NULL,
  //     Level INTEGER NOT NULL,
  //     Language TEXT NOT NULL,
  //     ImageLink TEXT NOT NULL,
  //     Genres TEXT NOT NULL,
  //     Last_TID INTEGER NOT NULL
  //   );

  //   -- Insert data into Stock table if empty (ensure unique Book_ID)
  // INSERT OR IGNORE INTO Stock (Book_Name, Level, Language, Genres, Last_TID, ImageLink)
  // VALUES 
  //  ('Panchatantra', 1, 'Hindi', 'Fables, Classic', 101, 'https://m.media-amazon.com/images/I/81xqg04BTLL._AC_UF894,1000_QL80_.jpg'),
  //   ('Malgudi Days', 2, 'Kannada', 'Fiction, Drama', 102, 'https://upload.wikimedia.org/wikipedia/en/e/ea/DVD_Cover_of_Malgudi_Days.jpeg'),
  //   ('Chandamama', 3, 'Telugu', 'Fantasy, Adventure', 103, 'https://rukminim2.flixcart.com/image/850/1000/kxjav0w0/regionalbooks/z/y/4/chandamama-stories-1-english-book-multi-colour-original-imag9z78kgt6re32.jpeg?q=20&crop=false'),
  //   ('Aithihyamala', 4, 'Malayalam', 'Mythology, Classic', 104, 'https://m.media-amazon.com/images/I/71aXX8WI-1L._AC_UF1000,1000_QL80_.jpg'),
  //   ('Thirukkural', 5, 'Tamil', 'Ethics, Classic', 105, 'https://m.media-amazon.com/images/I/61XEdg1ka3S._AC_UF1000,1000_QL80_.jpg'),
  //   ('Pather Panchali', 6, 'Bengali', 'Drama, Classic', 106, 'https://m.media-amazon.com/images/I/81qR-aUxdiL._AC_UF1000,1000_QL80_.jpg'),
  //   ('Chandrakanta', 1, 'Hindi', 'Fantasy, Romance', 107, 'https://rukminim2.flixcart.com/image/850/1000/xif0q/book/r/k/7/chandrakanta-hindi-original-imagjyhbyzygpaxf.jpeg?q=90&crop=false'),
  //   ('Gitanjali', 2, 'Bengali', 'Poetry, Classic', 108, 'https://m.media-amazon.com/images/I/81gJA7cc3+L._AC_UF1000,1000_QL80_.jpg'),
  //   ('Shivaji The Great', 3, 'Marathi', 'Historical, Classic', 109, 'https://m.media-amazon.com/images/I/71NDa85qT7L._AC_UF1000,1000_QL80_.jpg'),
  //   ('Godaan', 4, 'Hindi', 'Drama, Classic', 110, 'https://rukminim2.flixcart.com/image/850/1000/xif0q/book/j/2/c/godan-hindi-classic-novel-original-imagpgp8zycrrrvw.jpeg?q=90&crop=false');

  //   -- Create Students table
  //   CREATE TABLE IF NOT EXISTS Students (
  //     StudentID INTEGER PRIMARY KEY AUTOINCREMENT,
  //     Name TEXT NOT NULL,
  //     DateOfBirth DATE NOT NULL,
  //     Books_Read TEXT NOT NULL,
  //     Current_Level INTEGER NOT NULL
  //   );

  //   -- Insert data into Students table if empty (ensure unique StudentID)
  //   INSERT OR IGNORE INTO Students (Name, DateOfBirth, Books_Read, Current_Level)
  //   VALUES 
  //     ('Aarav', '2010-01-01', '{"1": 5, "2": 3, "3": 0, "4": 0, "5": 0, "6": 0}', 2),
  //     ('Vivaan', '2011-02-01', '{"1": 4, "2": 4, "3": 2, "4": 0, "5": 0, "6": 0}', 3),
  //     ('Aditya', '2012-03-01', '{"1": 6, "2": 5, "3": 3, "4": 1, "5": 0, "6": 0}', 4),
  //     ('Ananya', '2013-04-01', '{"1": 3, "2": 0, "3": 0, "4": 0, "5": 0, "6": 0}', 1),
  //     ('Diya', '2014-05-01', '{"1": 5, "2": 4, "3": 2, "4": 0, "5": 0, "6": 0}', 3),
  //     ('Ishaan', '2015-06-01', '{"1": 6, "2": 6, "3": 6, "4": 6, "5": 5, "6": 1}', 6),
  //     ('Kabir', '2016-07-01', '{"1": 6, "2": 5, "3": 5, "4": 3, "5": 0, "6": 0}', 4),
  //     ('Aditi', '2017-08-01', '{"1": 2, "2": 1, "3": 0, "4": 0, "5": 0, "6": 0}', 2),
  //     ('Reyansh', '2018-09-01', '{"1": 4, "2": 4, "3": 4, "4": 3, "5": 2, "6": 0}', 5),
  //     ('Saanvi', '2019-10-01', '{"1": 6, "2": 6, "3": 6, "4": 5, "5": 4, "6": 3}', 6);

  //   -- Create TransactionsCheckOut table
  //   CREATE TABLE IF NOT EXISTS TransactionsCheckOut (
  //     TID TEXT PRIMARY KEY,
  //     Student TEXT NOT NULL,
  //     Book TEXT NOT NULL,
  //     Date TEXT NOT NULL
  //   );

  //   -- Create TransactionsCheckIn table
  //   CREATE TABLE IF NOT EXISTS TransactionsCheckIn (
  //     TID TEXT PRIMARY KEY,
  //     Student TEXT NOT NULL,
  //     Book TEXT NOT NULL,
  //     Date TEXT NOT NULL,
  //     Feedback TEXT NOT NULL,
  //     FineAmount INTEGER DEFAULT 0
  //   );
  // `);

  //  await db.execAsync(`
  //   PRAGMA foreign_keys = ON;
  //   PRAGMA journal_mode = WAL;

  //   -- Drop tables if they exist
  //   DROP TABLE IF EXISTS Teachers;

  //   -- Create Teachers table with ProfilePicture as a URL (TEXT field)
  //   CREATE TABLE IF NOT EXISTS Teachers (
  //     TeacherID INTEGER PRIMARY KEY AUTOINCREMENT,
  //     TeacherName TEXT NOT NULL,
  //     SchoolID INTEGER,  -- Nullable to allow flexibility
  //     Email TEXT NOT NULL,
  //     Password TEXT NOT NULL,
  //     ProfilePicture TEXT,  -- Store the image as a URL instead of binary data
  //     ContactInfo TEXT,
  //     Designation TEXT,
  //     Qualifications TEXT,
  //     DateOfBirth TEXT,  -- Can store in 'YYYY-MM-DD' format
  //     Age INTEGER,  -- Nullable
  //     Gender TEXT,  -- Nullable
  //     JoinedDate TEXT,  -- Nullable, can store 'YYYY-MM-DD' format
  //     Location TEXT,  -- Nullable
  //     BloodGroup TEXT,
  //     MartialStatus TEXT,
  //     MotherTongue TEXT,
  //     Nationality TEXT
  //   );

  //   -- Insert example data with profile picture URLs
  //   INSERT INTO Teachers (
  //     TeacherName, SchoolID, Email, Password, ProfilePicture, ContactInfo, Designation, 
  //     Qualifications, DateOfBirth, Age, Gender, JoinedDate, Location, BloodGroup, 
  //     MartialStatus, MotherTongue, Nationality
  //   ) VALUES (
  //     'Teacher1', 
  //     1, 
  //     'teacher1@example.com', 
  //     'password1', 
  //     'https://avatars.githubusercontent.com/u/108755779?v=4',  -- Profile picture as a URL
  //     '123-456-7890', 
  //     'Mathematics Teacher', 
  //     'MSc in Mathematics', 
  //     '1980-05-12', 
  //     44,  -- Age
  //     'Male',  -- Gender
  //     '2020-01-15',  -- Joined Date
  //     'New York, USA',  -- Location
  //     'O+', 
  //     'Married', 
  //     'English', 
  //     'American'
  //   );

  //   INSERT INTO Teachers (
  //     TeacherName, SchoolID, Email, Password, ProfilePicture, ContactInfo, Designation, 
  //     Qualifications, DateOfBirth, Age, Gender, JoinedDate, Location, BloodGroup, 
  //     MartialStatus, MotherTongue, Nationality
  //   ) VALUES (
  //     'Teacher2', 
  //     NULL,  -- SchoolID is nullable
  //     'teacher2@example.com', 
  //     'password2', 
  //     'https://avatars.githubusercontent.com/u/109843726?v=4',  -- No profile picture uploaded yet
  //     '987-654-3210', 
  //     'Science Teacher', 
  //     'BSc in Physics', 
  //     '1985-08-22', 
  //     39,  -- Age
  //     'Female',  -- Gender
  //     '2019-05-20',  -- Joined Date
  //     'Toronto, Canada',  -- Location
  //     'A-', 
  //     'Single', 
  //     'French', 
  //     'Canadian'
  //   );

  //   INSERT INTO Teachers (
  //     TeacherName, SchoolID, Email, Password, ProfilePicture, ContactInfo, Designation, 
  //     Qualifications, DateOfBirth, Age, Gender, JoinedDate, Location, BloodGroup, 
  //     MartialStatus, MotherTongue, Nationality
  //   ) VALUES (
  //     'Teacher3', 
  //     3, 
  //     'teacher3@example.com', 
  //     'password3', 
  //     'https://avatars.githubusercontent.com/u/114910241?v=4',  -- Another profile picture URL
  //     '555-555-5555', 
  //     'History Teacher', 
  //     'PhD in History', 
  //     '1975-03-30', 
  //     49,  -- Age
  //     'Male',  -- Gender
  //     '2018-09-10',  -- Joined Date
  //     'London, UK',  -- Location
  //     'B+', 
  //     'Divorced', 
  //     'Spanish', 
  //     'British'
  //   );
  //  `);


};
