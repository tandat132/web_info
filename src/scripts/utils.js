// Convert Vietnamese text to slug
function createSlug(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .trim()
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}

// Convert tag display name to slug
function tagToSlug(tag) {
  return createSlug(tag);
}

// Convert occupation display name to slug
function occupationToSlug(occupation) {
  return createSlug(occupation);
}

module.exports = {
  tagToSlug,
  occupationToSlug,
  createSlug
};