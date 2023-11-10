from boh_app.data.generate_items import gen_model_data


def test_unique_names():
    data = gen_model_data()
    names = [item["name"] for item in data]
    assert len(names) == len(set(names))
