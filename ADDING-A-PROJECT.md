# Adding a project

The easy way: open Claude Code in this folder, attach the photos and say "add a project".

Doing it by hand:

1. Open `src/content/projects`.
2. Make a new folder. Use lowercase words and dashes, such as `langley-custom-home-5200`. Never use a street address: this name becomes the web address.
3. Drop the photos in and name them `01.jpg`, `02.jpg`, `03.jpg`. Photo 01 is the main one.
4. Check the photos for a visible house number. If there is one, have it blurred before publishing.
5. Copy `index.md` from another project into the new folder and fill in the details:

```yaml
title: Langley Custom Home
category: residential        # residential or commercial
type: Custom Build
location: Langley, BC        # city only, never a street address
bedrooms: 6                  # leave out if it does not apply
bathrooms: 5
sqft: 5200
year: 2026
scope: ["General contracting", "Full custom build"]
featured: false              # true shows it on the home page
order: 15                    # lower numbers show first
hero: 01.jpg
draft: false                 # true hides it everywhere
alts: ["Front exterior", "Kitchen", "Living room"]   # one short label per photo, in order
```

6. Anything you write below the second `---` shows as a short description on the project page.
7. Save, then push (or ask Claude Code to "publish the new project").
