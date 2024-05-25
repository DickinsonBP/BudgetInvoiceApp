from django.shortcuts import render, get_object_or_404

from django.contrib.auth.models import User, Group

from rest_framework.response import Response
from rest_framework import status
from rest_framework.pagination import PageNumberPagination
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import BasePermission, IsAdminUser, BasePermission
from rest_framework.generics import ListCreateAPIView, ListAPIView, RetrieveUpdateDestroyAPIView, RetrieveAPIView
from rest_framework.views import APIView
from rest_framework.throttling import UserRateThrottle, AnonRateThrottle

from .models import *
from .serializers import *

#for pdf
from jinja2 import Environment
from jinja2 import FileSystemLoader
import pdfkit
from pdfkit import configuration

import os
import datetime
# Create your views here.


# The `ClientListView` class is a Django REST framework view that lists and creates client objects,
# with different permissions based on the request method.
# Only admin users can create new clients
# To see all the clients the user has to be autenticated
class ClientListView(ListCreateAPIView):
    queryset = Client.objects.all()
    serializer_class = ClientSerializer
    ordering_fields = ['nif','name','address','email','phone']
    search_fields = ['nif','name','address','email','phone']
    def get_permissions(self):
        if self.request.method == 'POST' or self.request.method == 'PUT' \
                or self.request.method == 'DELETE' or self.request.method == 'PATCH':
            # return [IsAdminUser()]
            return [BasePermission()]
        return [BasePermission()]
    
class SingleClientView(RetrieveAPIView, RetrieveUpdateDestroyAPIView):
    queryset = Client.objects.all()
    serializer_class = ClientSerializer
    def get_permissions(self):
        if self.request.method == 'POST' or self.request.method == 'PUT' \
                or self.request.method == 'DELETE' or self.request.method == 'PATCH':
            # return [IsAdminUser()]
            return [BasePermission()]
        return [BasePermission()]
# The class `BudgetView` defines API views for listing and creating budget objects with specific
# permissions based on request methods, while `SingleBudgetView` defines API views for retrieving,
# updating, and deleting individual budget objects with similar permissions.
class BudgetView(ListAPIView, ListCreateAPIView):
    queryset = Budget.objects.all()
    serializer_class = BudgetSerializer
    ordering_fields = ['title','data','price','client']
    search_fields = ['title','data','price','client']
    
    def get_permissions(self):
        if self.request.method == 'POST':
            # return [IsAdminUser()]
            return [BasePermission()]
        if self.request.method == 'PATCH':
            # return [IsAdminUser()]
            return [BasePermission()]
        return [BasePermission()]
    
class SingleBudgetView(RetrieveAPIView, RetrieveUpdateDestroyAPIView):
    queryset = Budget.objects.all()
    serializer_class = BudgetSerializer
    def get_permissions(self):
        if self.request.method == 'POST' or self.request.method == 'PUT' \
                or self.request.method == 'DELETE' or self.request.method == 'PATCH':
            # return [IsAdminUser()]
            return [BasePermission()]
        return [BasePermission()]


# The class defines views for handling multiple invoices and individual invoice operations with
# permission checks based on user roles.
class InvoiceView(ListAPIView, ListCreateAPIView):
    queryset = Invoice.objects.all()
    serializer_class = InvoiceSerializer
    ordering_fields = ['price']
    search_fields = ['title']
    
    def get_permissions(self):
        if self.request.method == 'POST':
            return [BasePermission()]
        if self.request.method == 'PATCH':
            return [BasePermission()]
        return [BasePermission()]
    
class SingleInvoiceView(RetrieveAPIView, RetrieveUpdateDestroyAPIView):
    queryset = Invoice.objects.all()
    serializer_class = InvoiceSerializer
    def get_permissions(self):
        if self.request.method == 'POST' or self.request.method == 'PUT' \
                or self.request.method == 'DELETE' or self.request.method == 'PATCH':
            return [BasePermission()]
        return [BasePermission()]
    
@api_view()
def invoice_pdf(request, pk):
    invoice = get_object_or_404(Invoice, pk=pk)
    serlized_item = InvoiceSerializer(invoice)
    create_pdf(
        "invoice",
        serlized_item.data,
        # "C:/Users/dicki/Desktop/Salida/Facturas"
        "/media/pi/DICKINSON/DICKINSON/Salida/Facturas"
    )
    return Response(serlized_item.data)

@api_view()
def budget_pdf(request, pk):
    budget = get_object_or_404(Budget, pk=pk)
    serlized_item = BudgetSerializer(budget)
    create_pdf(
        "budget",
        serlized_item.data,
        # "C:/Users/dicki/Desktop/Salida/Presupuestos"
        "/media/pi/DICKINSON/DICKINSON/Salida/Presupuestos"
    )
    return Response(serlized_item.data)
    
def create_pdf(doc_type, data, save_path):
    #populate data
    render_vars = {}
    
    render_vars['owner_name'] = 'Omar de Jesus Bedoya Orrego'
    render_vars['owner_nif'] = '55486382D'
    render_vars['owner_phone'] = 687311861
    render_vars['owner_email'] = 'serviciosbedoya@hotmail.com'
    if(doc_type == "invoice"):
        render_vars['payment_text'] = 'Pago a la siguiente cuenta'
        render_vars['owner_account_number'] = 'ES63 0182 6240 62 0201590287'
    
    render_vars['doc_title'] = gen_realId(data["id"]) +"_"+ data['title']
    render_vars['doc_type'] = "Factura" if doc_type == "invoice" else "Presupuesto"
    
    render_vars['doc_number'] = gen_realId(data["id"])
    
    client = get_client_data(data['client'])
    
    render_vars['client_name'] = client['name']
    render_vars['nif'] = client['nif']
    render_vars['address'] = client['address']
    render_vars['desc'] = gen_table(data['data'])
    
    template_path = 'document_A4.html'
    render_vars['subtotal'] = data['price']
    render_vars['vat'] = data['vat']
    vat_total = (float(render_vars["subtotal"])*float(render_vars['vat']))/100
    render_vars['vat_total'] = vat_total
    render_vars['total'] = "%.2f" % (vat_total + float(render_vars['subtotal']))
    
    
    env = Environment(loader=FileSystemLoader('BudgetInvoiceAPI/templates'))
    template = env.get_template(template_path)
    
    html_out = template.render(render_vars)
    
    # path_wkhtmltopdf = 'C:/Program Files/wkhtmltopdf/bin/wkhtmltopdf.exe'
    path_wkhtmltopdf = '/usr/bin/wkhtmltopdf'
    config = configuration(wkhtmltopdf=path_wkhtmltopdf)
    
    options = {
        "enable-local-file-access": "",
        "encoding": "UTF-8",
        "page-size": "A4",
        "margin-top": "10mm",
        "margin-right": "10mm",
        "margin-bottom": "10mm",
        "margin-left": "10mm",
    }
    
    doc_name = os.path.join(save_path, render_vars['doc_title']+".pdf")

    file_content = pdfkit.from_string(
        html_out,
        doc_name,
        css='/home/pi/Projects/BudgetInvoiceApp/Backend/BudgetInvoiceAPI/templates/invoice.css',
        # css=r'D:\CODES\BudgetInvoiceApp\Backend\BudgetInvoiceAPI\templates\invoice.css',
        #css=r'C:\Users\dicki\Desktop\CODES\BudgetInvoiceApp\Backend\BudgetInvoiceAPI\templates\invoice.css',
        options=options,
        configuration=config
    )

def gen_realId(id):
    current_year = str(datetime.datetime.now().year)[2:]
    return current_year + str(id).zfill(3)
    
    
def gen_table(description):
    html = ""
    for items in description.keys():
        if(type(description[items]) != list):
            for key, value in description[items].items():
                if(key == 'title'): html += "<tr><td colspan='2'><b><i>{}</i></b></td></tr>".format(value)
                elif (key == 'entries'):
                    for entry in value:
                        price = "{:.2f}".format(entry['price'])
                        html += """
                            <tr>
                                <td style="display: flex; flex-direction: row-reverse;">
                                    <span style="flex: 1;">{}</span>
                                </td>
                                <td style="display: flex; flex-direction: row-reverse;">
                                    <span style="text-align: right;">{}€</span>
                                </td>
                            </tr>""".format(entry['text'], price)
    if(description['notes']):
        html += "<tr><td colspan='2'><b><i>Nota</i></b></td></tr>"
        for note in description['notes']:
            html += "<tr><td colspan='2'>{}</td></tr>".format(note)
    return html

def get_invoice_data(id):
    invoice = get_object_or_404(Invoice, id=id)
    return {
        'id': invoice.id,
        'title': invoice.title,
        'client': invoice.client,
        'budget': invoice.budget,
        'price': invoice.price
    }
    
def get_client_data(id):
    client = get_object_or_404(Client, id=id)
    return {
        'id': client.id,
        'nif': client.nif,
        'name': client.name,
        'address': client.address,
        'email': client.email,
        'phone': client.phone,
    }