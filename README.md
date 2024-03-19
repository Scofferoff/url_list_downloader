This Node script downloads urls (JPG only) from a list generated from all open tabs in Firefox.
Open all the images you want to download in new tabs

Designed to be run in WSL2 / Linux CLI 

How to use:

1: Install Node.js

2: Add manifest.json to Firefox from about:debugging > Load temporary Addon

2a: Open all the images you want in new tabs (middle mouse click)

3: From Firefox's extension menu, select "Save All Tab URLs"

4: Save the new tab that lists all open tabs as a text file

5: Run the script: $ node url_list_downloader <url_list.txt from Step #4> <location/of/folder/to/save/in>

6: All files are saved using uuid techniques to avoid conlicts. run ./set_original_names.sh to revert to url defined names (conflicts will result in minor name changes)
