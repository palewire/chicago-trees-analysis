all:
	pipenv run jupyter execute 01_parse.ipynb
	pipenv run jupyter execute 02_standardize.ipynb
	pipenv run jupyter execute 03_geocode.ipynb
	pipenv run jupyter execute 04_analyze.ipynb