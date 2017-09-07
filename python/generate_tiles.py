import nibabel as nib
from PIL import Image
from os.path import join
import simplejson as json
import os
import argparse
import numpy as np
from matplotlib.pyplot import *
import matplotlib.pyplot as plt
import hashlib
from nipype.utils.filemanip import load_json

def make_mask_dict(tile_data):
    tile_dict = {}
    for i in range(tile_data.shape[0]):
        for j in range(tile_data.shape[1]):
            if (int(tile_data[i,j])):
                if not i in tile_dict.keys():
                    tile_dict[i] = {}
                tile_dict[i][j] = int(tile_data[i,j])
    return tile_dict


def save_json(filename, data):
    """Save data to a json file

    Parameters
    ----------
    filename : str
        Filename to save data in.
    data : dict
        Dictionary to save in json file.

    """
    mode = 'w'
    if sys.version_info[0] < 3:
        mode = 'wb'
    with open(filename, mode) as fp:
        json.dump(data, fp, sort_keys=True, indent=None, separators=(',',':'))

def save_json_pretty(filename, data):
    """Save data to a json file
    Parameters
    ----------
    filename : str
        Filename to save data in.
    data : dict
        Dictionary to save in json file.
    """
    mode = 'w'
    if sys.version_info[0] < 3:
        mode = 'wb'
    with open(filename, mode) as fp:
        json.dump(data, fp, sort_keys=True, indent=4)

def mplfig(data, outfile):
    fig = plt.figure(frameon=False)
    fig.set_size_inches(float(data.shape[1])/data.shape[0], 1)
    ax = plt.Axes(fig, [0., 0., 1., 1.])
    ax.set_axis_off()
    fig.add_axes(ax)
    ax.imshow(data, aspect='normal', cmap=cm.Greys_r)
    fig.savefig(outfile, dpi=data.shape[0])
    plt.close()

def create_image(image, mask, output_file, size=1):

    mask_data = load_json(mask)
    image_data = plt.imread(image)
    mask_arr = np.zeros((image_data.shape[0], image_data.shape[1]))
    for ikey, vald in mask_data.items():
        for jkey, val in vald.items():
            mask_arr[int(jkey), int(ikey)] = val


    mask_arr[mask_arr==0] = np.nan

    fig = plt.figure(frameon=False)
    fig.set_size_inches(float(image_data.shape[1])/image_data.shape[0]*size, 1*size)
    ax = plt.Axes(fig, [0., 0., 1., 1.])
    ax.set_axis_off()
    fig.add_axes(ax)

    ax.imshow(image_data)
    ax.imshow(mask_arr, cmap=plt.cm.autumn_r, alpha=0.5)

    plt.savefig(output_file)
    plt.close('all')
    return output_file

def create_tiles(base_file, mask_file, slice_direction, outdir,
                 vox_thresh=100, use_mpl=True, name_by_hash=True,
                 custom_fov = None):
    slicer = {"ax": 0, "cor": 1, "sag": 2}
    assert slice_direction in slicer.keys(), "slice direction must be one of {}".format(slicer.keys())
    img_data = nib.load(base_file)
    data = img_data.get_data()
    img_mask = nib.load(mask_file)
    mask = img_mask.get_data()
    assert np.isclose(img_data.affine, img_mask.affine, rtol=1e-3, atol=1e-3).all(), "affines are not close!! {} {}".format(img_data.affine, img_mask.affine)

    aff = img_data.affine
    orientation = nib.orientations.io_orientation(aff)
    print("original image orientation is", "".join(nib.orientations.aff2axcodes(aff)))
    print("now converting to IPL")

    def toIPL(data):
        data_RAS = nib.orientations.apply_orientation(data, orientation) #In RAS
        return nib.orientations.apply_orientation(data_RAS, nib.orientations.axcodes2ornt("IPL")) #IPL is its own inverse

    data_IPL = toIPL(data)
    mask_IPL = toIPL(mask)


    all_data_slicer = [slice(None), slice(None), slice(None)]

    num_slices = data_IPL.shape[slicer[slice_direction]]
    print("total number of slices =", num_slices, "in direction:", slice_direction)
    if not os.path.exists(outdir):
        os.makedirs(outdir)
    manifest = {}
    output_manifest_file = os.path.join(outdir, os.path.split(base_file)[-1]+".json")
    manifest["mask_file"] = mask_file
    manifest["orientation"] = nib.orientations.aff2axcodes(aff)
    manifest["base_file"] = base_file
    manifest["slide_direction"] = slice_direction
    manifest["output_directory"] = outdir
    manifest["slices"] = {}
    for slice_num in range(num_slices):
        all_data_slicer[slicer[slice_direction]] = slice_num
        mask_tile = mask_IPL[all_data_slicer] > 0
        if np.sum(mask_tile) >= vox_thresh:
            #then we want to create the tile
            base_tile = data_IPL[all_data_slicer]
            imshow(base_tile)
            if custom_fov:
                fov = custom_fov(base_tile)
                base_tile = base_tile[fov]
                mask_tile = mask_tile[fov]
                #imshow(base_tile)

            im = Image.fromarray(base_tile).convert('RGB')

            if name_by_hash:
                to_hash = repr("".join(base_tile.ravel().astype(str))).encode('utf-8')
                fname_prefix = hashlib.sha224(to_hash).hexdigest()
            else:
                fname_prefix = "{}_{}".format(slice_direction, slice_num)

            manifest["slices"][slice_num] = dict(hashstr=fname_prefix)
            out_base_filename = join(outdir,"%s.jpg" % (fname_prefix))

            if use_mpl:
                mplfig(base_tile, out_base_filename)
            else:
                im.save(out_base_filename)

            manifest["slices"][slice_num]["base_filename"] = out_base_filename
            out_mask_filename = join(outdir,"%s.json" % (fname_prefix))

            out_mask_dict = make_mask_dict(mask_tile.T) #Width is x and height is y, so we transpose
            save_json(out_mask_filename, out_mask_dict)
            manifest["slices"][slice_num]["mask_filename"] = out_mask_filename

            if custom_fov:
                manifest["slices"][slice_num]["fov"] = fov.__repr__()

            print("wrote", out_base_filename, out_mask_filename)
            create_image(out_base_filename, out_mask_filename, out_base_filename.replace(".jpg", ".png"))



    save_json(output_manifest_file, manifest)
    print("\n\n\n", output_manifest_file,"\n\n\n")
    return im, base_tile, out_mask_dict

    save_json_pretty(output_manifest_file, manifest)
    print("\n\n\n", output_manifest_file,"\n\n\n")
    return im, base_tile


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("-b", "--base", dest="base", required=True)
    parser.add_argument("-m", "--mask", dest="mask")
    parser.add_argument("-d", "--dir", dest="slice_dir")
    parser.add_argument("-o", "--output", dest="output")
    parser.add_argument("-u", "--use_mpl", dest="use_mp", default=1)
    parser.add_argument("-v", "--vox_thresh", dest="vox_thresh", default=100)
    parser.add_argument("-n", "--name_by_hash", dest="name_by_hash", default=False)
    parser.add_argument("-f", "--fov", dest="fov", default=None)

    def Xfov(base_tile):
        X = np.nonzero(base_tile.sum(1) > 0)
        return [X[0],slice(None)]

    fovs = {"x": Xfov}

    args = parser.parse_args()
    if args.fov:
        args.fov = fovs[args.fov]
    print(args)

    create_tiles(os.path.abspath(args.base),
                 os.path.abspath(args.mask),
                 args.slice_dir,
                 os.path.abspath(args.output),
                 int(args.vox_thresh),
                 args.use_mp,
                 bool(args.name_by_hash),
                 args.fov)
