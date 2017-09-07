from glob import glob
import os
import argparse
import requests
from pathlib import Path
import simplejson as json
from simplejson import JSONDecodeError
import os
from requests.auth import HTTPBasicAuth

def load_json(filename):
    """Load data from a json file
    Parameters
    ----------
    filename : str
        Filename to load data from.
    Returns
    -------
    data : dict
    """

    with open(filename, 'r') as fp:
        data = json.load(fp)
    return data


databases = {
"prod": 'http://api.medulina.com/api/v1/',
"dev": 'http://testapi.medulina.com/api/v1/'
}

def upload_to_mindR(imgPath, task, subject, username, password, database="prod"):
    api_token = "NnrP65CXaSnZ0aLPZ8Ox64d0pDlSKS0R8wpymwLr"
    # this code assumes that the jpg, the json describing it,
    # and the mask file have the same name with different extenstions
    url = databases[database]
    i = Path(imgPath)
    j = i.with_suffix('.json')

    img_dat = { 'session': 0,
                'slice': str(i).split("_")[-1].split(".")[0],
                'slice_direction': str(i).split("/")[-1].split("_")[0],
                'subject': subject,
                'task': task,
                'mode': "train",
                "session": "first",
                }

    with open(str(j),'r') as h:
        manifest = json.load(h)
    import matplotlib.pyplot as pp
    shape = list(pp.imread(i).shape)[:2]
    img_dat["shape"]= str(shape)
    print(img_dat)
    print(type(img_dat["shape"]))
    with open(str(i),'rb') as img:
        #context_pic = '/Users/akeshavan/Dropbox/software/mindgames/python/outputs/context/slice%03d.jpg' % int(img_dat["slice"])
        #print(context_pic)
        #with open(context_pic, 'rb') as c:
        #    print(img_dat.keys())
        r = requests.post(url+'image',files={'pic':img}, #'context':c},
            data=img_dat, headers={'Authorization':api_token})

    m = i.with_suffix('.json')
    try:
        print(r.json())
        image_id = r.json()['_id']
    except JSONDecodeError:
        print(r.text)

    if m.exists():
        mask_dat = {'image_id':image_id,
                    'mode':'truth',
                    'task': task
                    }

        with open(str(m),'rb') as h:
            mask_dat['pic'] = json.dumps(load_json(str(m)))
            print("uploading truth", str(m))
            rm = requests.post(url+'mask',
                data=mask_dat,
                headers={'Authorization':api_token},
                #auth=(username, password)
                )

            print(rm.request.headers, rm.text)
            return rm



if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("-d", "--directory", dest="directory", required=True)
    parser.add_argument("-t", "--task", dest="task")
    parser.add_argument("-s", "--subject", dest="subject")
    parser.add_argument("-u", "--username", dest="username")
    parser.add_argument("-p", "--password", dest="password")
    parser.add_argument("-b", "--database", dest="database", default = "prod")

    args = parser.parse_args()

    all_images = glob(os.path.join(args.directory, "*.jpg"))
    print("found {} images".format(len(all_images)))
    for im in all_images:
        rm = upload_to_mindR(im, args.task, args.subject, args.username, args.password, args.database)
        if rm == None:
            print("error with", im)
