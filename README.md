LASULI – Social annotation for qualitative analysis
====================================================

Contact: <aurelien.benel@utt.fr>

Home page: <https://github.com/Hypertopic/LaSuli>

Notice
------

If you just want to **use** LaSuli, [install its **stable version**](https://hypertopic.s3.amazonaws.com/lasuli.xpi).

The following instructions are only for people willing to **modify** the software or to test the development version.

Installation requirements
-------------------------

- Git client
- Node.js
- Firefox

Installation procedure
----------------------

    npm install

Launch in development mode
--------------------------

    npm start

Build for distribution
----------------------

    npm config set api_key xxxxxxx
    npm config set api_secret xxxxxxx
    npm run build
