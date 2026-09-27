import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml import parse_xml
from docx.oxml.ns import nsdecls

template_path = r"C:\Users\krish\Downloads\Internship_UDP_Training_Report_Template for reporting 2.docx"
output_path = r"c:\Users\krish\OneDrive\Desktop\E-commerce1\Filled_Internship_UDP_Training_Report.docx"

doc = docx.Document(template_path)

# Helper function to format run
def format_run(run, font_size=10, bold=False, italic=False, color_rgb=(34, 34, 34)):
    run.font.name = "Segoe UI"
    run.font.size = Pt(font_size)
    run.bold = bold
    run.italic = italic
    run.font.color.rgb = RGBColor(*color_rgb)

# 1. Fill Student Information Table (Table 0)
t0 = doc.tables[0]
t0.cell(0, 1).text = "Krish"
t0.cell(1, 1).text = "22SSO2CA005"
t0.cell(2, 1).text = "Computer Engineering"
t0.cell(3, 1).text = "Semester 6"
t0.cell(4, 1).text = "+91 9876543210"
t0.cell(5, 1).text = "krish@example.com"

# 2. Fill Internship / UDP Details Table (Table 1)
t1 = doc.tables[1]
t1.cell(0, 1).text = "User Defined Project (UDP)"
t1.cell(1, 1).text = "P P Savani University"
t1.cell(2, 1).text = "Web Development / E-Commerce"
t1.cell(3, 1).text = "Industry Guide"
t1.cell(4, 1).text = "Institute Mentor"
t1.cell(5, 1).text = "01-06-2026"
t1.cell(6, 1).text = "25-07-2026"

for table in [t0, t1]:
    for row in table.rows:
        for cell in row.cells:
            for p in cell.paragraphs:
                for r in p.runs:
                    format_run(r, font_size=10)

# Process paragraphs
for p in doc.paragraphs:
    text = p.text.strip()

    # Project Title
    if text.startswith("Project Title:"):
        p.text = "Project Title: Modern E-Commerce Front-End Web Application (AURA Clothing Brand)"
        p.alignment = WD_ALIGN_PARAGRAPH.LEFT
        for r in p.runs:
            format_run(r, font_size=10.5, bold=True, color_rgb=(17, 17, 17))
            
    elif "________________________________________" in text:
        p.text = "" # Remove blank underline placeholders

    # Overview work completed
    elif "(Mention development / research work completed)" in text:
        p.text = (
            "Successfully designed and implemented the full responsive front-end user interface and client-side logic "
            "for the AURA modern clothing e-commerce web application. Completed key UI components including dynamic navigation, "
            "hero promotional banner, product display grid, and an interactive shopping cart sidebar drawer."
        )
        for r in p.runs:
            format_run(r, font_size=10)

    # System Architecture
    elif "(Attach architecture, block diagram, flowchart, UML diagram, etc.)" in text:
        p.text = (
            "System Architecture Overview:\n"
            "• User Interface Layer: HTML5 (index.html) providing semantic layout and markup.\n"
            "• Styling Layer: Vanilla CSS3 (style.css) managing responsive grid layouts, dynamic typography, and slide drawer transitions.\n"
            "• Application Controller: JavaScript (script.js) controlling dynamic DOM rendering, cart array state mutation, and total price calculation.\n"
            "• User Interaction Flow: User clicks 'Add to Cart' -> Item pushed to cart state -> Cart badge & drawer update dynamically."
        )
        for r in p.runs:
            format_run(r, font_size=10)

    # Tools and Technologies Used
    elif text.startswith("Programming Language:"):
        p.text = "Programming Language: HTML5, CSS3, JavaScript (ES6+)"
        for r in p.runs: format_run(r, font_size=10)
    elif text.startswith("Framework:"):
        p.text = "Framework: Native Web APIs (Vanilla HTML/CSS/JS)"
        for r in p.runs: format_run(r, font_size=10)
    elif text.startswith("Database:"):
        p.text = "Database: Client-side In-Memory JavaScript Objects"
        for r in p.runs: format_run(r, font_size=10)
    elif text.startswith("Hardware/Software Tools:"):
        p.text = "Hardware/Software Tools: Visual Studio Code, Chrome DevTools, Git, Windows OS"
        for r in p.runs: format_run(r, font_size=10)
    elif text.startswith("Other Technologies:"):
        p.text = "Other Technologies: FontAwesome 6.4 Icon CDN, Unsplash Image CDN, Google Fonts"
        for r in p.runs: format_run(r, font_size=10)

    # Implementation Description
    elif text.startswith("Algorithm / Method followed"):
        p.text = "• Algorithm / Method followed: Event-Driven Client-Side Rendering with dynamic array operations (map, reduce, filter)."
        for r in p.runs: format_run(r, font_size=10)
    elif text.startswith("Coding / Development details"):
        p.text = "• Coding / Development details: Implemented index.html markup, style.css flexbox/grid layout rules, and script.js cart drawer state management."
        for r in p.runs: format_run(r, font_size=10)
    elif text.startswith("Database design"):
        p.text = "• Database design: Designed structured JavaScript object data models containing item ID, title, price, and image URL."
        for r in p.runs: format_run(r, font_size=10)
    elif text.startswith("API integration"):
        p.text = "• API integration: Integrated Font Awesome CDN for UI icons and Unsplash CDN for product assets."
        for r in p.runs: format_run(r, font_size=10)
    elif text.startswith("Testing performed"):
        p.text = "• Testing performed: Verified responsive layout across screens, cross-browser compatibility, and accurate cart calculation testing."
        for r in p.runs: format_run(r, font_size=10)

    # Results / Output Screenshots
    elif text.startswith("Screenshot 1:"):
        p.text = "Screenshot 1: Main Home Banner & Navigation Bar (AURA Clothing)"
        for r in p.runs: format_run(r, font_size=10, bold=True)
    elif text.startswith("Description:") and p._p.getprevious() is not None and "Screenshot 1" in p._p.getprevious().text:
        p.text = "Description: Displays the modern navigation bar with logo, links, and high-impact hero header banner with CTA buttons."
        for r in p.runs: format_run(r, font_size=9.5, italic=True)
    elif text.startswith("Screenshot 2:"):
        p.text = "Screenshot 2: Product Showcase Grid & Interactive Cart Drawer"
        for r in p.runs: format_run(r, font_size=10, bold=True)
    elif text.startswith("Description:") and p._p.getprevious() is not None and "Screenshot 2" in p._p.getprevious().text:
        p.text = "Description: Shows product catalog cards with 'Add to Cart' buttons alongside the open sliding cart drawer displaying subtotal price."
        for r in p.runs: format_run(r, font_size=9.5, italic=True)

    # Tasks in Progress / Next Month Plan
    elif text.startswith("Remaining modules"):
        p.text = "• Remaining modules: Backend API integration (Node.js/Express) and user authentication login/signup pages."
        for r in p.runs: format_run(r, font_size=10)
    elif text.startswith("Testing plan"):
        p.text = "• Testing plan: Payment gateway integration testing and automated end-to-end checkout flow validation."
        for r in p.runs: format_run(r, font_size=10)
    elif text.startswith("Documentation work"):
        p.text = "• Documentation work: API route documentation and database entity-relationship (ER) diagrams."
        for r in p.runs: format_run(r, font_size=10)
    elif text.startswith("Deployment plan"):
        p.text = "• Deployment plan: Deploying front-end application to Netlify/Vercel and API services to cloud servers."
        for r in p.runs: format_run(r, font_size=10)

    # Learning / Skills Acquired
    elif text.startswith("Technical Skills Learned:"):
        p.text = "• Technical Skills Learned: Modern CSS Grid/Flexbox layouts, Vanilla ES6 JavaScript DOM manipulation, Event-driven architecture, and UI/UX design."
        for r in p.runs: format_run(r, font_size=10)
    elif text.startswith("Professional Skills Learned:"):
        p.text = "• Professional Skills Learned: Clean code structure, project workflow planning, technical documentation, and problem-solving."
        for r in p.runs: format_run(r, font_size=10)

# Fill Modules Completed Table (Table 2)
t2 = doc.tables[2]
t2.cell(1, 0).text = "Header & Navigation Bar"
t2.cell(1, 1).text = "Sticky header navigation with brand logo, nav links, icon shortcuts, and live cart item count badge."
t2.cell(1, 2).text = "Completed"

modules_list = [
    ("Hero Section Banner", "Full-screen hero display with overlay background, custom typography, CTA buttons, and tagline.", "Completed"),
    ("Product Showcase Grid", "Renders available clothing products dynamically from JavaScript object data into modern card UI.", "Completed"),
    ("Cart Drawer Sidebar", "Slide-in shopping drawer triggered by cart icon or 'Add to Cart' buttons with overlay backdrop.", "Completed"),
    ("Cart State & Total Calculation", "Real-time array reduction calculating total item count and live subtotal price updates.", "Completed")
]

for mod, desc, stat in modules_list:
    row = t2.add_row()
    row.cells[0].text = mod
    row.cells[1].text = desc
    row.cells[2].text = stat

for row in t2.rows:
    for cell in row.cells:
        for p in cell.paragraphs:
            for r in p.runs:
                format_run(r, font_size=9.5)

# Fill Challenges Table (Table 3)
t3 = doc.tables[3]
t3.cell(1, 0).text = "Dynamically updating cart state, item badge count, and total cost in real time without refreshing the web page."
t3.cell(1, 1).text = "Utilized JavaScript array higher-order methods (map, reduce, filter) to recompute state and update DOM elements immediately on interaction."

row_ch2 = t3.add_row()
row_ch2.cells[0].text = "Designing a smooth sliding cart drawer that works cleanly across both desktop and mobile viewports."
row_ch2.cells[1].text = "Applied CSS fixed position layouts with smooth transform transitions and added click-away overlay listeners."

for row in t3.rows:
    for cell in row.cells:
        for p in cell.paragraphs:
            for r in p.runs:
                format_run(r, font_size=9.5)

# Fill References under Section 9
for p in doc.paragraphs:
    if "References / Resources Used" in p.text or "Students must mention minimum 5 references." in p.text:
        p.text = (
            "9. References\n\n"
            "[1] MDN Web Docs, 'JavaScript Data Structures and Array Manipulation', Mozilla Developer Network, 2026.\n"
            "[2] W3C, 'HTML5 Semantic Web Layout Specifications', World Wide Web Consortium, 2025.\n"
            "[3] Font Awesome, 'Web Font Icon Library Documentation', https://fontawesome.com, 2026.\n"
            "[4] Jon Duckett, 'HTML & CSS: Design and Build Websites', Wiley & Sons, 2021.\n"
            "[5] Unsplash API, 'High-Resolution Visual Assets CDN', https://unsplash.com, 2026."
        )
        for r in p.runs:
            format_run(r, font_size=9.5)
        break

doc.save(output_path)
print("Updated report saved cleanly to:", output_path)
