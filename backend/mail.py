import subprocess


def send_checkout_mails():
    subprocess.run(["lualatex", "checkout.tex"], cwd="Latex")


def compile_latex(name):
    subprocess.run(["lualatex", name+".tex"], cwd="Latex")


def format_float(input):
    return '{0:.2f}'.format(input).replace(".", ",")


def send_checkout_mail(name, current_balance, income, paid):
    income_sum = 0
    paid_sum = 0

    income_table = ""
    paid_table = ""

    for idx, i in enumerate(income):
        income_sum += i[2]

        line = ""
        if idx % 2 == 0:
            income_table += "\\rowcolor[gray]{.9}"

        line += f"{i[0]} & {i[1]} & {format_float(i[2])}€\\tabularnewline\n"
        income_table += line

    for idx, i in enumerate(paid):
        paid_sum += i[2]

        line = ""
        if idx % 2 == 0:
            paid_table += "\\rowcolor[gray]{.9}"

        line += f"{i[0]} & {i[1]} & {format_float(i[2])}€\\tabularnewline\n"
        paid_table += line

    paid_table += "\\midrule\n"
    income_table += "\\midrule\n"

    raw_latex_file = None
    with open('Latex/checkout-template.tex') as reader:
        raw_latex_file = reader.read()

    raw_latex_file = raw_latex_file.replace("??name??", name)
    raw_latex_file = raw_latex_file.replace(
        "??current-balance??", format_float(current_balance))

    raw_latex_file = raw_latex_file.replace(
        "??income-sum??", format_float(income_sum))
    raw_latex_file = raw_latex_file.replace(
        "??paid-sum??", format_float(paid_sum))

    raw_latex_file = raw_latex_file.replace("??income-table??", income_table)
    raw_latex_file = raw_latex_file.replace("??paid-table??", paid_table)

    with open('Latex/checkout.tex', "w") as writer:
        writer.write(raw_latex_file)

    compile_latex("checkout")
