import re
import nltk
from nltk.tokenize import sent_tokenize

# Ensure NLTK resources are downloaded
try:
    nltk.data.find('tokenizers/punkt')
except LookupError:
    nltk.download('punkt', quiet=True)

# -----------------------------
# Main Topic Definitions
# -----------------------------
topic_map = {
    "menstruation": "Menstruation is the monthly shedding of the uterine lining (endometrium) through the vagina.",
    "period": "A period is part of the menstrual cycle when the uterus sheds its lining, causing bleeding.",
    "menstrual cycle": "The menstrual cycle is the monthly sequence preparing the female body for pregnancy: menstruation, follicular phase, ovulation, and luteal phase.",
    "ovulation": "Ovulation is the release of a mature egg from the ovary, usually around the 14th day of the cycle.",
    "estrogen": "Estrogen is a primary female sex hormone that regulates reproductive functions and secondary sexual traits.",
    "progesterone": "Progesterone prepares the uterus for pregnancy and supports early pregnancy.",
    "lh": "Luteinizing Hormone (LH) triggers ovulation and development of the corpus luteum.",
    "fsh": "Follicle Stimulating Hormone (FSH) stimulates ovarian follicle growth and egg maturation.",
    "fertilisation": "Fertilisation is the fusion of sperm and egg to form a zygote.",
    "zygote": "A zygote is the single-celled structure formed immediately after fertilisation.",
    "embryo": "An embryo is the early stage of development arising from the zygote.",
    "foetus": "A foetus is the stage of human development after 8 weeks of pregnancy until birth.",
    "spermatogenesis": "Spermatogenesis is the formation of sperm cells inside the seminiferous tubules of testes.",
    "spermiogenesis": "Spermiogenesis is the transformation of spermatids into mature spermatozoa.",
    "spermiation": "Spermiation is the release of mature sperm into the lumen of seminiferous tubules.",
    "primary spermatocytes": "Primary spermatocytes are diploid cells that undergo meiosis I to form secondary spermatocytes.",
    "secondary spermatocytes": "Secondary spermatocytes are haploid cells formed after meiosis I, which undergo meiosis II to produce spermatids.",
    "spermatids": "Spermatids are immature haploid gametes that develop into spermatozoa.",
    "spermatozoa": "Spermatozoa are mature male gametes capable of fertilising an egg.",
    "sex of baby": "The sex of a baby is determined by the sperm: X chromosome for female (XX), Y chromosome for male (XY).",
    "gender of baby": "The gender of a baby depends on whether the fertilising sperm carries X or Y chromosome.",
    "pcos": "Polycystic Ovary Syndrome (PCOS) is a hormonal disorder causing irregular periods, excess androgen levels, and multiple cysts in ovaries.",
    "polycystic ovary syndrome": "Polycystic Ovary Syndrome (PCOS) is a hormonal condition where ovaries produce excess androgens, leading to irregular cycles, acne, or infertility.",
    "infertility": "Infertility is the inability to conceive after 12 months of regular, unprotected sexual intercourse.",
    "endometriosis": "Endometriosis is a painful disorder where tissue similar to the uterine lining grows outside the uterus, often affecting fertility.",
    "miscarriage": "A miscarriage is the spontaneous loss of a pregnancy before the 20th week.",
    "stillbirth": "Stillbirth is the loss of a baby after 20 weeks of pregnancy but before birth.",
    "menopause": "Menopause is the natural end of menstrual cycles, diagnosed after 12 months without a period, usually occurring around age 45–55.",
    "perimenopause": "Perimenopause is the transition period before menopause marked by irregular cycles, hot flashes, and hormonal changes.",
    "amenorrhea": "Amenorrhea is the absence of menstruation—either primary (never occurred) or secondary (stopped for 3+ months).",
    "dysmenorrhea": "Dysmenorrhea refers to painful menstruation, commonly caused by strong uterine contractions.",
    "pms": "Premenstrual Syndrome (PMS) is a group of emotional and physical symptoms that occur before menstruation.",
    "pmdd": "Premenstrual Dysphoric Disorder (PMDD) is a severe form of PMS causing intense mood swings, irritability, and physical symptoms.",
    "abortion": "Abortion is the medical termination of a pregnancy. It may be spontaneous (miscarriage) or induced (surgical or medical).",
  "medical abortion": "Medical abortion uses medicines such as mifepristone and misoprostol to end an early pregnancy safely.",
  "surgical abortion": "Surgical abortion is a medical procedure (like vacuum aspiration or dilation and curettage) to terminate pregnancy.",
  "safe abortion": "Safe abortion is performed by a trained healthcare provider using approved methods under hygienic conditions.",
  "unsafe abortion": "Unsafe abortion is performed without proper medical supervision, often leading to severe health risks or death.",
  "forced abortion": "Forced abortion is when a woman is compelled to terminate a pregnancy against her will.",
  "illegal abortion": "Illegal abortion is performed outside the legal framework of the country, often without safety measures.",
  "abortion rights": "Abortion rights refer to a woman's legal and human right to make decisions about ending a pregnancy.",
  "abortion law india": "In India, abortion is regulated under the Medical Termination of Pregnancy Act, 1971 (amended in 2021), allowing abortion up to 24 weeks under certain conditions."

}


# Aliases (Expanded)
# -----------------------------
aliases = {
    # menstruation synonyms
    "periods": "menstruation",
    "monthly cycle": "menstrual cycle",
    "menses": "menstruation",
    "chums": "menstruation",
    "bleeding": "menstruation",

    # ovulation
    "ovulating": "ovulation",
    "egg release": "ovulation",

    # hormones
    "luteinizing hormone": "lh",
    "follicle stimulating hormone": "fsh",
    "female hormones": "estrogen",

    # pregnancy / reproduction
    "pregnancy stages": "embryo",
    "foetal development": "foetus",
    "baby gender": "gender of baby",
    "child sex": "sex of baby",

    # sperm development
    "sperm": "spermatozoa",
    "sperm formation": "spermatogenesis",
    "male gamete": "spermatozoa",
    
    "polycystic ovaries": "pcos",
    "cysts in ovaries": "pcos",
    "fertility issues": "infertility",
    "unable to conceive": "infertility",
    "pregnancy loss": "miscarriage",
    "lost pregnancy": "miscarriage",
    "period pain": "dysmenorrhea",
    "cramps": "dysmenorrhea",
    "no periods": "amenorrhea",
    "irregular cycles": "pcos",
    "change of life": "menopause",
    "pre menopause": "perimenopause"
}

# -----------------------------
# Cleaner Answer Function
# -----------------------------
# -----------------------------
# Cleaner Answer Function
# -----------------------------
def clean_answer(question: str, raw_answer: str, top_results: list[dict] = None) -> str:
    q_lower = question.lower().strip()
    used_alias = None
    command = None

    # -----------------------------
    # Step 0: Normalize using aliases
    # -----------------------------
    for alias, canonical in aliases.items():
        if alias in q_lower:
            q_lower = canonical
            used_alias = alias
            break

    # -----------------------------
    # Step 0.5: Detect command type
    # -----------------------------
    if q_lower.startswith("what"):
        command = "what"
    elif q_lower.startswith("who"):
        command = "who"
    elif q_lower.startswith("when"):
        command = "when"
    elif q_lower.startswith("list"):
        command = "list"

    answer = raw_answer.strip()

    # -----------------------------
    # Step 1: Topic mapping
    # -----------------------------
    for keyword, mapped in topic_map.items():
        if keyword in q_lower:
            answer = mapped
            break

    # -----------------------------
    # Step 2: Fallback to top_results (improved handling)
    # -----------------------------
    if (len(answer.split()) < 5 or "summary" in answer.lower()) and top_results:
        for result in top_results:
            text = result if isinstance(result, str) else result.get("text", "")
            if any(word in text.lower() for word in q_lower.split()):
                answer = text
                break
        if answer.strip() == raw_answer.strip() and top_results:
            first = top_results[0]
            answer = first if isinstance(first, str) else first.get("text", "")

    # -----------------------------
    # Step 3: Remove noisy patterns
    # -----------------------------
    noisy_patterns = [
        r"Rack Your Brain.*", r"Previous Year.*", r"Resources.*",
        r"Apps.*", r"Definitions.*", r"See.*guide.*",
        r"Watch this video.*", r"Gray Matter.*"
    ]
    for pattern in noisy_patterns:
        answer = re.sub(pattern, "", answer, flags=re.IGNORECASE | re.DOTALL)

    # -----------------------------
    # Step 4: Context detection for list command (improved handling)
    # -----------------------------
    if command == "list":
        categories = {
            "women laws": ["law", "rights", "section", "ipc", "legal"],
            "hormones": ["estrogen", "progesterone", "lh", "fsh", "hormone"],
            "fertility issues": ["pcos", "infertility", "miscarriage", "endometriosis", "fertility"]
        }

        relevant_category = None
        for cat, keywords in categories.items():
            if any(k in q_lower for k in keywords):
                relevant_category = cat
                break

        list_items = []
        if top_results and relevant_category:
            for result in top_results:
                text = result if isinstance(result, str) else result.get("text", "")
                if any(k in text.lower() for k in categories[relevant_category]):
                    items = re.split(r"[\n•\-]", text)
                    items = [i.strip() for i in items if len(i.strip()) > 10]
                    list_items.extend(items)

        if not list_items:  # fallback to raw answer
            items = re.split(r"[\n•\-]", answer)
            list_items = [i.strip() for i in items if len(i.strip()) > 10]

        if list_items:
            return "\n".join([f"• {i}" for i in list_items[:10]])

    # -----------------------------
    # Step 5: Sentence filtering for other commands
    # -----------------------------
    if command != "list":
        sentences = sent_tokenize(answer)
        keywords = [w for w in q_lower.split() if w not in ["what", "is", "the", "a", "an", "of", "in", "and"]]
        filtered = [s for s in sentences if any(k in s.lower() for k in keywords)]
        if filtered:
            answer = " ".join(filtered[:3])

        answer = re.sub(r"\s+", " ", answer).strip()

        if command == "what" and answer and not re.match(r".* is .*", answer, re.IGNORECASE):
            display_word = used_alias + "/" + q_lower if used_alias else q_lower
            answer = f"{display_word.capitalize()} is {answer}"

    return answer

