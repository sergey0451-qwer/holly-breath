import zipfile
import xml.etree.ElementTree as ET

def extract_text_from_docx(docx_path):
    text = []
    try:
        with zipfile.ZipFile(docx_path) as docx:
            xml_content = docx.read('word/document.xml')
            tree = ET.fromstring(xml_content)
            namespaces = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
            for paragraph in tree.findall('.//w:p', namespaces):
                para_text = []
                for run in paragraph.findall('.//w:r', namespaces):
                    t = run.find('w:t', namespaces)
                    if t is not None and t.text is not None:
                        para_text.append(t.text)
                text.append(''.join(para_text))
        return '\n'.join(text)
    except Exception as e:
        return f"Error: {e}"

if __name__ == "__main__":
    path = R"c:\Users\Holy_\.gemini\antigravity\scratch\holly-breath\src\data\raw_songs.txt\СБОРНИК (1).docx"
    doc_text = extract_text_from_docx(path)
    with open("raw_text_output.txt", "w", encoding="utf-8") as f:
        f.write(doc_text)
    print("Done extracting. Length:", len(doc_text))
