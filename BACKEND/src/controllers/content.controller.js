import * as menuService from '../services/menu.service.js';
import * as specialService from '../services/special.service.js';
import * as galleryService from '../services/gallery.service.js';
import * as chefService from '../services/chef.service.js';
import catchAsync from '../utils/catchAsync.js';

// ---------- MENU ----------
export const getMenu = catchAsync(async (req, res) => {
    const items = await menuService.getAllMenuItems();
    res.status(200).json(items);
});

export const getMenuItem = catchAsync(async (req, res) => {
    const item = await menuService.getMenuItemById(req.params.id);
    res.status(200).json(item);
});

export const createMenuItem = catchAsync(async (req, res) => {
    const item = await menuService.createMenuItem(req.body);
    res.status(201).json(item);
});

export const updateMenuItem = catchAsync(async (req, res) => {
    const item = await menuService.updateMenuItem(req.params.id, req.body);
    res.status(200).json(item);
});

export const deleteMenuItem = catchAsync(async (req, res) => {
    await menuService.deleteMenuItem(req.params.id);
    res.status(204).send();
});

// ---------- SPECIALS ----------
export const getSpecials = catchAsync(async (req, res) => {
    const items = await specialService.getAllSpecials();
    res.status(200).json(items);
});

export const createSpecial = catchAsync(async (req, res) => {
    const item = await specialService.createSpecial(req.body);
    res.status(201).json(item);
});

export const updateSpecial = catchAsync(async (req, res) => {
    const item = await specialService.updateSpecial(req.params.id, req.body);
    res.status(200).json(item);
});

export const deleteSpecial = catchAsync(async (req, res) => {
    await specialService.deleteSpecial(req.params.id);
    res.status(204).send();
});

// ---------- GALLERY ----------
export const getGallery = catchAsync(async (req, res) => {
    const items = await galleryService.getAllGalleryItems();
    res.status(200).json(items);
});

export const createGalleryItem = catchAsync(async (req, res) => {
    const item = await galleryService.createGalleryItem(req.body);
    res.status(201).json(item);
});

export const updateGalleryItem = catchAsync(async (req, res) => {
    const item = await galleryService.updateGalleryItem(req.params.id, req.body);
    res.status(200).json(item);
});

export const deleteGalleryItem = catchAsync(async (req, res) => {
    await galleryService.deleteGalleryItem(req.params.id);
    res.status(204).send();
});

// ---------- CHEF ----------
export const getChef = catchAsync(async (req, res) => {
    const chef = await chefService.getChef();
    res.status(200).json(chef);
});

export const updateChef = catchAsync(async (req, res) => {
    const chef = await chefService.updateChef(req.body);
    res.status(200).json(chef);
});