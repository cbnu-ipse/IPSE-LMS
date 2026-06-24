from django import template
from django.urls import reverse

register = template.Library()

@register.simple_tag(takes_context=True)
def host_url(context, view_name, *args, **kwargs):
    clean_args = list(args)
    # template tag syntax {% host_url 'view_name' host 'host_name' %} passes
    # 'host' as a positional argument (which resolves to context variable, e.g. None or empty string)
    # and 'host_name' as a positional argument. We strip these last two arguments.
    if len(clean_args) >= 2 and clean_args[-1] in ('community', 'judge', 'game'):
        clean_args = clean_args[:-2]
    
    kwargs.pop('host', None)
    
    return reverse(view_name, args=clean_args, kwargs=kwargs)
