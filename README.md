# anime-suggestions
An idea to find anime recommendations.

Data used available on https://www.kaggle.com/datasets/azathoth42/myanimelist
Used UserAnimeList.csv for columns user, score, and anime.

Your MAL data obtainable by viewing personal list and clicking export xml. Rename to mal.xml and place where program files are. Included mal.xml is my data as example.

Results output wait may vary depending on the size of your list and the speed of your machine.
7th gen i7, 16GB ddr4 Ram, with SSD returned a result list in less than 30 seconds.
Intel Atom n455, 2GB ddr3 Ram, with HDD returned result in about 13 minutes.

Compiled executable available in [prototype.zip](https://github.com/ezrillex/anime-suggestions/raw/main/prototype.zip). Pre-indexed database [file](https://abarca.dev/mal.7z).

Known Drawbacks: 
- Recent anime is out of scope.
- Bias towards popular shows.
- Possibly changed/outdated opinions.
- People with big lists end higher due to the amount of datapoints.
- People with no common anime are ignored completely.
- Limited sample size due to limitations of data collected by kaggle dataset. (aka. mostly forum participants)
