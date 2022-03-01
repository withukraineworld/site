import pandas as pd
import json
import dotenv
import os
dotenv.load_dotenv()

msgs = pd.read_csv(os.getenv('MESSAGES_CSV_URL'))
msgs = msgs.set_index('country').fillna('')

df = pd.read_csv(os.getenv('POLITICIANS_CSV_URL'))
print(df.columns)
config = {
    'countries': list(df['country'].unique()),
    'messages': msgs['message'].to_dict()
}
with open(f'assets/data/config.json', 'w') as config_file:
    json.dump(config, config_file)
for country, politicians in df.groupby('country'):
    print(country)
    print(politicians)
    politicians.drop(columns='country').to_json(
        f'assets/data/politicians/{country}.json', orient='records')
