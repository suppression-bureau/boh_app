========
Overview
========

.. start-badges

.. list-table::
    :stub-columns: 1

    * - tests
      - |
        | |codecov|
    * - package
      - | |version| |wheel| |supported-versions| |supported-implementations|
        | |commits-since|

.. |codecov| image:: https://codecov.io/gh/ded8393/boh_app/branch/main/graphs/badge.svg?branch=main
    :alt: Coverage Status
    :target: https://app.codecov.io/github/ded8393/boh_app

.. |version| image:: https://img.shields.io/pypi/v/boh-app.svg
    :alt: PyPI Package latest release
    :target: https://pypi.org/project/boh-app

.. |wheel| image:: https://img.shields.io/pypi/wheel/boh-app.svg
    :alt: PyPI Wheel
    :target: https://pypi.org/project/boh-app

.. |supported-versions| image:: https://img.shields.io/pypi/pyversions/boh-app.svg
    :alt: Supported versions
    :target: https://pypi.org/project/boh-app

.. |supported-implementations| image:: https://img.shields.io/pypi/implementation/boh-app.svg
    :alt: Supported implementations
    :target: https://pypi.org/project/boh-app

.. |commits-since| image:: https://img.shields.io/github/commits-since/ded8393/boh_app/v0.0.0.svg
    :alt: Commits since latest release
    :target: https://github.com/ded8393/boh_app/compare/v0.0.0...main



.. end-badges

Companion app for Book of Hours

* Free software: MIT license

Installation
============

::

    pip install boh-app

You can also install the in-development version with::

    pip install https://github.com/ded8393/boh_app/archive/main.zip


Documentation
=============


https://boh_app.readthedocs.io/


Development
===========

To run all the tests run::

    tox

Note, to combine the coverage data from all the tox environments run:

.. list-table::
    :widths: 10 90
    :stub-columns: 1

    - - Windows
      - ::

            set PYTEST_ADDOPTS=--cov-append
            tox

    - - Other
      - ::

            PYTEST_ADDOPTS=--cov-append tox
