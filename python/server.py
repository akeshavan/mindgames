from flask import Flask, render_template, request, current_app
from werkzeug import secure_filename
import os
from generate_tiles import create_tiles, save_json_pretty
from nipype.utils.filemanip import load_json

app = Flask(__name__)
# Got from https://www.tutorialspoint.com/flask/flask_file_uploading.htm

@app.route('/')
def upload_file():
   #return render_template('upload.html')
   return current_app.send_static_file('upload.html')

@app.route('/uploader', methods = ['GET', 'POST'])
def upload_function():
   if request.method == 'POST':
      upload_putpath = 'uploaded_files/'
      if not os.path.exists(upload_putpath):
          os.makedirs(upload_putpath)
      json_path = os.path.join(upload_putpath, 'myuploads.json')

      if os.path.exists(json_path):
          myuploads = load_json(json_path)
      else:
          myuploads = {}

      f_image = request.files['image_file']
      f_mask = request.files['mask_file']
      slice_direction = request.form['slice_direction']
      task_type = request.form['task_type']
      min_Nvox = request.form['min_Nvox']
      ptid = request.form['patient_id']

      fname_image = os.path.basename(secure_filename(f_image.filename))
      fname_mask = os.path.basename(secure_filename(f_mask.filename))

      #Make the json entry
      myuploads['_'.join([task_type,ptid])] = {'patient_id':ptid,'mask_filename':secure_filename(f_mask.filename), \
      'image_filename':secure_filename(f_image.filename), \
      'Nvox_threshold':min_Nvox, 'task_type':task_type, \
      'slice_direction':slice_direction}

      #Save images in upload directory
      image_savepath = upload_putpath+ptid+'_image.nii.gz'
      mask_savepath = upload_putpath+ptid+'_mask.nii.gz'
      f_image.save(image_savepath)
      f_mask.save(mask_savepath)

      save_json_pretty(os.path.join(upload_putpath,'myuploads.json'), myuploads)

      #create tiles from the nifti image and save in tile directory
      create_tiles(image_savepath, mask_savepath, slice_direction,
                   os.path.join('tile_files', ptid, slice_direction),
                   int(min_Nvox), 1, False, None)


      if len(fname_image) > 0 and len(fname_mask) >0:
          return 'file uploaded'
      else:
          return "UHOH: please upload a valid file"

if __name__ == '__main__':
   #app.config['UPLOAD_FOLDER'] = "uploads/"

   #if not os.path.exists(app.config['UPLOAD_FOLDER']):
   #    os.makedirs(app.config['UPLOAD_FOLDER'])

   app.run(port=7000)
   print("running now")
