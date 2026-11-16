"""Editable Word letterhead: small header logo, faint mascot watermark behind the text, details and a live page number in the footer.
Run:  python3 brand/build-letterhead-docx.py   (needs: pip install python-docx; the PNG assets come from `npm run brand`)
Writes brand/print/letterhead-a4.docx. The page number is a PAGE field, so it updates on every page."""
import json, pathlib
from docx import Document
from docx.shared import Mm, Pt, RGBColor, Emu
from docx.enum.text import WD_TAB_ALIGNMENT
from docx.oxml import parse_xml
from docx.oxml.ns import nsdecls, qn

root = pathlib.Path(__file__).resolve().parent.parent
P = root / 'brand/print'
LOGO = P / 'letterhead-logo.png'
WM = P / 'letterhead-watermark.png'
D = json.loads((root / 'brand/details.json').read_text(encoding='utf-8'))
# the same two footer lines as the SVG letterhead (brand/build-print.mjs)
DETAILS = [f"{D['email']}  ·  {D['phone']}", '  ·  '.join(D['web'] + [D['address']])]

d = Document()
sec = d.sections[0]
sec.page_width, sec.page_height = Mm(210), Mm(297)
sec.left_margin = sec.right_margin = Mm(20)
sec.top_margin, sec.bottom_margin = Mm(38), Mm(30)
sec.header_distance, sec.footer_distance = Mm(13), Mm(12)
st = d.styles['Normal']; st.font.name = 'Arial'; st.font.size = Pt(10.5)
st.element.rPr.rFonts.set(qn('w:eastAsia'), 'Arial')

def border(par, side, sz=2, color='000000', space=4):
    pPr = par._p.get_or_add_pPr()
    b = parse_xml(f'<w:pBdr {nsdecls("w")}><w:{side} w:val="single" w:sz="{sz}" w:space="{space}" w:color="{color}"/></w:pBdr>')
    pPr.append(b)

# ---- header: small logo + hairline, watermark anchored behind the text
h = sec.header; hp = h.paragraphs[0]
hp.add_run().add_picture(str(LOGO), width=Mm(36))
border(hp, 'bottom', 2, '000000', 6)
wr = hp.add_run()
wr.add_picture(str(WM), width=Mm(110))
inline = wr._r.xpath('.//wp:inline')[0]
cx, cy = inline.extent.cx, inline.extent.cy
anchor = parse_xml(
    f'<wp:anchor {nsdecls("wp", "a", "pic", "r")} distT="0" distB="0" distL="0" distR="0" simplePos="0" relativeHeight="0" behindDoc="1" locked="0" layoutInCell="1" allowOverlap="1">'
    '<wp:simplePos x="0" y="0"/>'
    '<wp:positionH relativeFrom="page"><wp:align>center</wp:align></wp:positionH>'
    '<wp:positionV relativeFrom="page"><wp:posOffset>%d</wp:posOffset></wp:positionV>' % int(Mm(120))
    + f'<wp:extent cx="{cx}" cy="{cy}"/><wp:effectExtent l="0" t="0" r="0" b="0"/><wp:wrapNone/>'
    '<wp:docPr id="90" name="Watermark" descr="Faint mascot watermark"/><wp:cNvGraphicFramePr/></wp:anchor>')
anchor.append(inline.graphic)
inline.getparent().replace(inline, anchor)

# ---- footer: details left, "Page N" right (live field)
f = sec.footer
fp = f.paragraphs[0]
border(fp, 'top', 2, '000000', 6)
# the footer style carries default centre/right tabs; clear them so the page number lands on our right tab
for pos in (Mm(82.55), Mm(165.1)):
    fp.paragraph_format.tab_stops.add_tab_stop(pos, WD_TAB_ALIGNMENT.CLEAR)
fp.paragraph_format.tab_stops.add_tab_stop(Mm(170), WD_TAB_ALIGNMENT.RIGHT)
def run(par, text, bold=False):
    r = par.add_run(text); r.font.size = Pt(8); r.font.bold = bold; r.font.name = 'Arial'; return r
run(fp, DETAILS[0]); run(fp, '\tPage ', True)
for t, txt in (('begin', None), (None, ' PAGE '), ('separate', None), ('end', None)):
    r = fp.add_run(); r.font.size = Pt(8); r.font.bold = True; r.font.name = 'Arial'
    if t: r._r.append(parse_xml(f'<w:fldChar {nsdecls("w")} w:fldCharType="{t}"/>'))
    else: r._r.append(parse_xml(f'<w:instrText {nsdecls("w")} xml:space="preserve">{txt}</w:instrText>'))
    if t == 'separate': r._r.append(parse_xml(f'<w:t {nsdecls("w")}>1</w:t>'))
fp2 = f.add_paragraph(); run(fp2, DETAILS[1])
for p in (fp, fp2): p.paragraph_format.space_after = Pt(0)

# ---- sample body so the template is easy to see; replace it with the letter
d.add_paragraph('Cairo, ' + '[date]')
d.add_paragraph('')
d.add_paragraph('Dear [name],')
d.add_paragraph('[Write the letter here. The header, watermark and footer repeat on every page, and the page number updates automatically.]')
d.add_paragraph('')
d.add_paragraph('Sincerely,')
d.add_paragraph(D['name'])
d.save(str(P / 'letterhead-a4.docx'))
print('letterhead docx built')
