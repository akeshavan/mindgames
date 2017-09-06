from flask import Flask, render_template, request
from werkzeug import secure_filename
from generate_tiles import create_tiles
import os
from generate_tiles import create_tiles, save_json_pretty
from nipype.utils.filemanip import load_json

app = Flask(__name__)
# Got from https://www.tutorialspoint.com/flask/flask_file_uploading.htm

@app.route('/')
def upload_file():
   return render_template('upload.html')

@app.route('/uploader', methods = ['GET', 'POST'])
def upload_function():
   if request.method == 'POST':
      upload_putpath = 'uploaded_files/'
      if not os.path.exists(upload_putpath):
          os.makedirs(upload_putpath)
      json_path = os.path.join(upload_putpath, 'myuploads.json')

      if os.path.exists(json_path):
          myuploads = load_json(json_path)
          my_tasks = list(myuploads.keys())
      else:
          myuploads = {}
          my_tasks = []

      f_image = request.files['image_file']
      f_mask = request.files['mask_file']
      print("hello!!!")
      #fname_image, ext_image = os.path.splitext(secure_filename(f_image.filename))
      #fname_mask, ext_mask = os.path.splitext(secure_filename(f_mask.filename))
      fname_image = os.path.basename(secure_filename(f_image.filename))
      fname_mask = os.path.basename(secure_filename(f_mask.filename))

      image_savepath = upload_putpath+'image_'+fname_image
      mask_savepath = upload_putpath+'mask_'+fname_mask

      f_image.save(image_savepath)
      f_mask.save(mask_savepath)

      slice_direction = request.form['slice_direction']
      task_type = request.form['task_type']
      min_Nvox = request.form['min_Nvox']
      print(slice_direction, task_type, min_Nvox)

      if task_type in my_tasks:
          myuploads[task_type].append(fname_image)
      else:
          myuploads[task_type] = ['fname_image']

      save_json_pretty(os.path.join(upload_putpath,'myuploads.json'), myuploads)
      create_tiles(image_savepath, mask_savepath, slice_direction, 'tile_files/', int(min_Nvox), 1, False, None)

      if len(fname_image) > 0 and len(fname_mask) >0:
          return 'file uploaded successfully'
      else:
          return "UHOH: please upload a valid file"

if __name__ == '__main__':
   #app.config['UPLOAD_FOLDER'] = "uploads/"

   #if not os.path.exists(app.config['UPLOAD_FOLDER']):
   #    os.makedirs(app.config['UPLOAD_FOLDER'])

   app.run(port=7000)
   print("running now")
