/**
 * Migration d'initialisation des données de production dans PocketBase.
 * Générée automatiquement depuis l'export officiel Firebase RTDB.
 * Embarque les 5 listes réelles et les 152 cadeaux (aucun utilisateur préconfiguré).
 */

migrate((app) => {
  const listsCol = app.findCollectionByNameOrId('lists');
  const giftsCol = app.findCollectionByNameOrId('gifts');

  // Données des listes et cadeaux réels
  const listsData = [
  {
    "slug": "-OgCMBHS1GiKdXMdpJnK",
    "title": "Cadeaux pour Jesus",
    "ownerEmail": "jimmy@vuidart.com",
    "gifts": [
      {
        "title": "Des fidèles",
        "url": null,
        "position": 1,
        "bought": true
      },
      {
        "title": "La salvation",
        "url": null,
        "position": 2,
        "bought": false
      },
      {
        "title": "Exister pour de vrai au lieu 555 d'être un personnage de fiction débile",
        "url": null,
        "position": 7,
        "bought": false
      },
      {
        "title": "Joseph",
        "url": null,
        "position": 5,
        "bought": false
      },
      {
        "title": "Bible",
        "url": "https://www.google.com",
        "position": 0,
        "bought": false
      },
      {
        "title": "rterge",
        "url": null,
        "position": 9,
        "bought": false
      },
      {
        "title": "qzdqzdz",
        "url": null,
        "position": 4,
        "bought": true
      },
      {
        "title": "qzdqzdz",
        "url": null,
        "position": 8,
        "bought": false
      },
      {
        "title": "qzdqd",
        "url": null,
        "position": 6,
        "bought": false
      },
      {
        "title": "qzdqd",
        "url": null,
        "position": 3,
        "bought": false
      },
      {
        "title": "erree",
        "url": null,
        "position": 10,
        "bought": false
      }
    ]
  },
  {
    "slug": "cadeaux-jimmy",
    "title": "Cadeaux Jimmy",
    "ownerEmail": "jimmy@vuidart.com",
    "gifts": [
      {
        "title": "Sire Epidemais !!",
        "url": "https://fr.store.square-enix-games.com/final-fantasy-xiv-the-cornservant-plushie",
        "position": 1,
        "bought": false
      },
      {
        "title": "Porte clef Picto",
        "url": "https://fr.store.square-enix-games.com/final-fantasy-xiv-acrylic-job-keychain---pictomancer",
        "position": 0,
        "bought": false
      },
      {
        "title": "Machine à mettre sous-vide les aliments",
        "url": null,
        "position": 4,
        "bought": true
      },
      {
        "title": "Histoires de guerre",
        "url": "https://www.amazon.fr/dp/2749943086/ref=books_amazonstores_desktop_mfs_aufs_ap_sc_dsk_0?_encoding=UTF8&pd_rd_w=zU2Zb&pd_rd_wg=EwbYF&pd_rd_r=f6b2aaa4-a68b-4c1c-b8b7-57f681890664&content-id=amzn1.sym.4fc691ea-15d2-4e56-be8c-a94ca18faf38",
        "position": 2,
        "bought": false
      },
      {
        "title": "Histoires de guerre - Les Héros oubliés",
        "url": "https://www.amazon.fr/dp/2749943086/ref=books_amazonstores_desktop_mfs_aufs_ap_sc_dsk_0?_encoding=UTF8&pd_rd_w=zU2Zb&pd_rd_wg=EwbYF&pd_rd_r=f6b2aaa4-a68b-4c1c-b8b7-57f681890664&content-id=amzn1.sym.4fc691ea-15d2-4e56-be8c-a94ca18faf38",
        "position": 5,
        "bought": false
      },
      {
        "title": "Histoires de guerre - Cinq nouveaux destins",
        "url": "https://www.amazon.fr/dp/2749958741/ref=books_amazonstores_desktop_mfs_aufs_ap_sc_dsk_2?_encoding=UTF8&pd_rd_w=zU2Zb&pd_rd_wg=EwbYF&pd_rd_r=f6b2aaa4-a68b-4c1c-b8b7-57f681890664&content-id=amzn1.sym.4fc691ea-15d2-4e56-be8c-a94ca18faf38",
        "position": 3,
        "bought": false
      },
      {
        "title": "Gadgets de cuisine ou maison",
        "url": null,
        "position": 6,
        "bought": false
      },
      {
        "title": "Trucs utile pour économiser de la place à la maison",
        "url": null,
        "position": 7,
        "bought": false
      },
      {
        "title": "Carte cadeau Steam / Nintendo eShop",
        "url": null,
        "position": 8,
        "bought": false
      },
      {
        "title": "Chocolat",
        "url": null,
        "position": 9,
        "bought": false
      },
      {
        "title": "Fromage rare (à pâte dure)",
        "url": null,
        "position": 10,
        "bought": false
      },
      {
        "title": "Goodies Nintendo",
        "url": null,
        "position": 12,
        "bought": false
      },
      {
        "title": "Goodies Final Fantasy",
        "url": null,
        "position": 11,
        "bought": false
      },
      {
        "title": "Borderlands 4",
        "url": null,
        "position": 13,
        "bought": false
      }
    ]
  },
  {
    "slug": "deborah",
    "title": "Déborah",
    "ownerEmail": "deborah@vuidart.com",
    "gifts": [
      {
        "title": "Briquet gravé avec photo des chats",
        "url": null,
        "position": 1765468350384,
        "bought": false
      },
      {
        "title": "Écran ordinateur (secondaire)",
        "url": null,
        "position": 1765468366059,
        "bought": false
      },
      {
        "title": "Feutre acryliques pointes pinceau nuances bleues",
        "url": null,
        "position": 1765468395919,
        "bought": false
      },
      {
        "title": "Feutre acryliques pointes pinceau nuances violetes",
        "url": null,
        "position": 1765468401135,
        "bought": false
      },
      {
        "title": "Feutre acryliques pointes pinceau nuances vertes",
        "url": null,
        "position": 1765468407273,
        "bought": false
      },
      {
        "title": "Livre de coloriage",
        "url": "https://www.amazon.fr/Coloriages-myst%C3%A8res-Pok%C3%A9mon-Hachette/dp/2017276693/ref=sr_1_9?crid=2XNVJJQZ14KT6&dib=eyJ2IjoiMSJ9.8RT0h_jt7fnBjHhvjNSwGVezzGX7HWZJvkCmHCCPFezhqyc2GVpDjGZvuCCErLoWSQWIX-wx5cj87cLibviwiMUkrWcYVO2ASWeWkDrjwNxoPQs-kiiT23wrOaDgZXuggdMCVK8n-Ou01fRm5I7DL3ZxVhklmzJx2i1kyi_-i71fp9KoAzDWt6VLuprK1MdZ169sv-70i5o517GNh21Zgfw2aVDLunBuDHZuKJn3_b56zrHYpwrAauZQcEtgu6qg8nrmxYP8a-8eNayKL3d2lsweYtWeo3OpYm5J3L-1Ing.yy2QwuYeoE6SFBgj0DRNXWGjsTxHg35D3muR9ez8NWg&dib_tag=se&keywords=coloriage+mystere&qid=1765281853&sprefix=coloria%2Caps%2C73&sr=8-9",
        "position": 1765468434123,
        "bought": false
      },
      {
        "title": "Livre de coloriage",
        "url": "https://www.amazon.fr/Coloriages-myst%C3%A8res-Disney-Vitraux-2/dp/2017312576/ref=sr_1_23?crid=2XNVJJQZ14KT6&dib=eyJ2IjoiMSJ9.8RT0h_jt7fnBjHhvjNSwGVezzGX7HWZJvkCmHCCPFezhqyc2GVpDjGZvuCCErLoWSQWIX-wx5cj87cLibviwiMUkrWcYVO2ASWeWkDrjwNxoPQs-kiiT23wrOaDgZXuggdMCVK8n-Ou01fRm5I7DL3ZxVhklmzJx2i1kyi_-i71fp9KoAzDWt6VLuprK1MdZ169sv-70i5o517GNh21Zgfw2aVDLunBuDHZuKJn3_b56zrHYpwrAauZQcEtgu6qg8nrmxYP8a-8eNayKL3d2lsweYtWeo3OpYm5J3L-1Ing.yy2QwuYeoE6SFBgj0DRNXWGjsTxHg35D3muR9ez8NWg&dib_tag=se&keywords=coloriage+mystere&qid=1765281853&sprefix=coloria%2Caps%2C73&sr=8-23",
        "position": 1765468464875,
        "bought": false
      },
      {
        "title": "Figurine Jingliu",
        "url": "https://www.amazon.fr/RZAHUAHU-Honkai-Jingliu-Figurine-Figurines/dp/B0D644W3SQ/ref=sr_1_8?dib=eyJ2IjoiMSJ9.a90OiRKz-7wko9l4x9UI3ZZi13TriCP6eTNGBITNNj4E2mJXuiqJHZf53HOjrxzWKHKQ3UV4H3GoQuztCpkl8srphCSDmzPVHS40tB6bsnRAlBTl2EJi_fdqpP10YcMRPiec8Rj9kHxP0O53a-w3wIlBJdPBweuAaF8GoCsusxsQCDDQ_uDCQQzVXIq1kMgcPl8Qm6fV32Y9lAI1CZHoi3Z0qv_iRcR_IDUiE_dsOvO7HbH6kAWYKohaeS5aOZIiyTz2wF3OhfQ0J39nOEXJHCF_E_FNBJwYnXIzOi_vhZU._jyfraghCt0sJ04tkTijeE3hIAQfL-SnVPkV6Bx1fZA&dib_tag=se&keywords=honkai%2Bstar%2Brail&qid=1733146771&sr=8-8&th=1",
        "position": 1765468486857,
        "bought": false
      },
      {
        "title": "Figurine Acheron",
        "url": "https://www.amazon.fr/RZAHUAHU-Honkai-Figurine-argent%C3%A9s-Figurines/dp/B0DCTT3Q9V/ref=sr_1_16?dib=eyJ2IjoiMSJ9.a90OiRKz-7wko9l4x9UI3ZZi13TriCP6eTNGBITNNj4E2mJXuiqJHZf53HOjrxzWKHKQ3UV4H3GoQuztCpkl8srphCSDmzPVHS40tB6bsnRAlBTl2EJi_fdqpP10YcMRPiec8Rj9kHxP0O53a-w3wIlBJdPBweuAaF8GoCsusxsQCDDQ_uDCQQzVXIq1kMgcPl8Qm6fV32Y9lAI1CZHoi3Z0qv_iRcR_IDUiE_dsOvO7HbH6kAWYKohaeS5aOZIiyTz2wF3OhfQ0J39nOEXJHCF_E_FNBJwYnXIzOi_vhZU._jyfraghCt0sJ04tkTijeE3hIAQfL-SnVPkV6Bx1fZA&dib_tag=se&keywords=honkai+star+rail&qid=1733146771&sr=8-16",
        "position": 1765468504912,
        "bought": false
      },
      {
        "title": "Figurine Morgana",
        "url": "https://merch.riotgames.com/fr-fr/product/morgana-unlocked/",
        "position": 1765468576965,
        "bought": false
      },
      {
        "title": "Borderlands 4",
        "url": null,
        "position": 1765468585829,
        "bought": false
      },
      {
        "title": "Abonnement FFXIV",
        "url": "https://fr.store.square-enix-games.com/final-fantasy-xiv-online-60-day-game-time-card---digital",
        "position": 1765468642765,
        "bought": false
      },
      {
        "title": "Carte cadeau Steam",
        "url": null,
        "position": 1765468655465,
        "bought": false
      },
      {
        "title": "Films : collection Barbie (sauf Dreamhouse ou Aventure dans les étoiles)",
        "url": null,
        "position": 1765468686461,
        "bought": false
      },
      {
        "title": "Films : Collection Hôtel Transylvanie",
        "url": null,
        "position": 1765468703279,
        "bought": false
      },
      {
        "title": "Presse-jus électrique",
        "url": null,
        "position": 1765468715005,
        "bought": true
      },
      {
        "title": "Plastifieuse",
        "url": null,
        "position": 1765468730001,
        "bought": true
      },
      {
        "title": "Ouvre-bocal",
        "url": null,
        "position": 1765468739065,
        "bought": false
      }
    ]
  },
  {
    "slug": "joyeux-nowel",
    "title": "JOYEUX NOWEL",
    "ownerEmail": "jimmy@vuidart.com",
    "gifts": []
  },
  {
    "slug": "noel-2025-andy",
    "title": "Noël 2025 Andy",
    "ownerEmail": "andy@vuidart.com",
    "gifts": [
      {
        "title": "Drop Trivia",
        "url": "https://www.amazon.fr/dp/B0D73RLZ4J/?coliid=I2QAQAJODY7R3N&colid=D4JQHTB7962O&psc=1&ref_=list_c_wl_lv_ov_lig_dp_it",
        "position": 1,
        "bought": false
      },
      {
        "title": "Outsmarted",
        "url": "amazon.fr/dp/B0DC6TS51V/?coliid=I2XIOUIA0RXH4S&colid=D4JQHTB7962O&psc=1",
        "position": 0,
        "bought": false
      },
      {
        "title": "Scrabble voyage",
        "url": "https://www.amazon.fr/dp/B00R105IPY/?coliid=I1EFGF5FUX6LB&colid=D4JQHTB7962O&psc=1&ref_=list_c_wl_lv_ov_lig_dp_it",
        "position": 2,
        "bought": false
      },
      {
        "title": "Mixmo",
        "url": "https://www.amazon.fr/dp/B0C6V443KD/?coliid=I37SZJ5BM0HQKZ&colid=D4JQHTB7962O&psc=1&ref_=list_c_wl_lv_ov_lig_dp_it",
        "position": 3,
        "bought": false
      },
      {
        "title": "Blokus",
        "url": "https://www.amazon.fr/dp/B00FBWBM3G/?coliid=I39WDFU3VZQZ30&colid=D4JQHTB7962O&psc=1&ref_=list_c_wl_lv_ov_lig_dp_it",
        "position": 4,
        "bought": false
      },
      {
        "title": "Le Roi des 12",
        "url": "https://www.amazon.fr/dp/B0933G6HF9/?coliid=IR139BA3H2BUN&colid=D4JQHTB7962O&psc=1&ref_=list_c_wl_lv_ov_lig_dp_it",
        "position": 5,
        "bought": false
      },
      {
        "title": "Nommez-en 5",
        "url": "https://www.amazon.fr/dp/B0BC98DRGG/?coliid=IR0NBHDA58LUW&colid=D4JQHTB7962O&psc=1&ref_=list_c_wl_lv_ov_lig_dp_it",
        "position": 6,
        "bought": false
      },
      {
        "title": "Sifflard",
        "url": "https://www.amazon.fr/dp/B0FVG9NS48/?coliid=I27EH51JZSTBO7&colid=D4JQHTB7962O&psc=1&ref_=list_c_wl_lv_ov_lig_dp_it",
        "position": 7,
        "bought": false
      },
      {
        "title": "Choix de Merde",
        "url": "https://www.amazon.fr/dp/B0BDZJ5FLB/?coliid=I3P3TV9GAWNMIJ&colid=D4JQHTB7962O&psc=1&ref_=list_c_wl_lv_ov_lig_dp_it",
        "position": 8,
        "bought": false
      },
      {
        "title": "ONO 99",
        "url": "https://www.amazon.fr/dp/B09C932KCR/?coliid=I2R7T624QJ1HGT&colid=D4JQHTB7962O&psc=1&ref_=list_c_wl_lv_ov_lig_dp_it",
        "position": 9,
        "bought": false
      },
      {
        "title": "Smart 10",
        "url": "https://www.amazon.fr/dp/B0BSLSLQHT/?coliid=I24C8MBGT0CYLI&colid=D4JQHTB7962O&psc=1&ref_=list_c_wl_lv_ov_lig_dp_it",
        "position": 10,
        "bought": false
      },
      {
        "title": "Fucking Dilem",
        "url": "https://www.amazon.fr/dp/B0C6F4P3Y8/?coliid=IBSS5UER6RZD8&colid=D4JQHTB7962O&psc=0&ref_=list_c_wl_lv_ov_lig_dp_it",
        "position": 11,
        "bought": false
      },
      {
        "title": "Nine",
        "url": "https://www.amazon.fr/dp/B0CTHYQNT8/?coliid=I273X0K91J72GH&colid=D4JQHTB7962O&psc=1&ref_=list_c_wl_lv_ov_lig_dp_it",
        "position": 12,
        "bought": false
      },
      {
        "title": "Scattergories",
        "url": "https://www.amazon.fr/dp/B0CJVJDBZS/?coliid=I3BI2AE3ZDQ8KR&colid=D4JQHTB7962O&psc=1&ref_=list_c_wl_lv_ov_lig_dp_it",
        "position": 13,
        "bought": false
      },
      {
        "title": "Tower Up",
        "url": "https://www.amazon.fr/dp/B0789Q79V7/?coliid=I1GZHIV3Q19RG3&colid=D4JQHTB7962O&psc=1&ref_=list_c_wl_lv_ov_lig_dp_it",
        "position": 14,
        "bought": false
      },
      {
        "title": "Balconia",
        "url": "https://www.amazon.fr/dp/B0DQQVQNCY/?coliid=I18I76DBIIF45A&colid=D4JQHTB7962O&psc=1&ref_=list_c_wl_lv_ov_lig_dp_it",
        "position": 15,
        "bought": false
      },
      {
        "title": "Dékal",
        "url": "https://www.amazon.fr/dp/B0CY2Z26L3/?coliid=I3Q1CQX837A30T&colid=D4JQHTB7962O&psc=1&ref_=list_c_wl_lv_ov_lig_dp_it",
        "position": 16,
        "bought": false
      },
      {
        "title": "The Gang",
        "url": "https://www.amazon.fr/dp/B0DPQCXT6X/?coliid=I342NJIRKXRCKS&colid=D4JQHTB7962O&psc=1&ref_=list_c_wl_lv_ov_lig_dp_it",
        "position": 17,
        "bought": false
      },
      {
        "title": "Link City",
        "url": "https://www.amazon.fr/dp/B0D5MC471H/?coliid=I3PD6P68LJLVBO&colid=D4JQHTB7962O&psc=1&ref_=list_c_wl_lv_ov_lig_dp_it",
        "position": 18,
        "bought": false
      },
      {
        "title": "Refuge",
        "url": "https://www.amazon.fr/dp/B0DN2GW8GF/?coliid=I6T0GNM9VA3JT&colid=D4JQHTB7962O&psc=1&ref_=list_c_wl_lv_ov_lig_dp_it",
        "position": 19,
        "bought": false
      },
      {
        "title": "YUBIBO",
        "url": "https://www.amazon.fr/dp/B0FTZSK9GG/?coliid=ITBBQ07XZVO8F&colid=D4JQHTB7962O&psc=1&ref_=list_c_wl_lv_ov_lig_dp_it",
        "position": 20,
        "bought": false
      },
      {
        "title": "Flip 7",
        "url": "https://www.amazon.fr/dp/B07NS9QJFN/?coliid=I3GQ9NHX7L0YL5&colid=D4JQHTB7962O&psc=1&ref_=list_c_wl_lv_ov_lig_dp_it",
        "position": 21,
        "bought": false
      },
      {
        "title": "DJ Set",
        "url": "https://www.amazon.fr/dp/B0FVFCHC3W/?coliid=I24XIII4QECGHX&colid=D4JQHTB7962O&psc=1&ref_=list_c_wl_lv_ov_lig_dp_it",
        "position": 22,
        "bought": false
      },
      {
        "title": "One Round",
        "url": "https://www.amazon.fr/dp/B0DT9GP3VQ/?coliid=INVYONBEHKAPE&colid=D4JQHTB7962O&psc=1&ref_=list_c_wl_lv_ov_lig_dp_it",
        "position": 23,
        "bought": false
      },
      {
        "title": "Le Plus Proche Gagne",
        "url": "https://www.amazon.fr/dp/B0DBQVY1KG/?coliid=I1ATL0P03SJAV2&colid=D4JQHTB7962O&psc=1&ref_=list_c_wl_lv_ov_lig_dp_it",
        "position": 24,
        "bought": false
      },
      {
        "title": "TILT",
        "url": "https://www.amazon.fr/dp/B0FJ8T6PCK/?coliid=I1C875VVJH5YF3&colid=D4JQHTB7962O&psc=1&ref_=list_c_wl_lv_ov_lig_dp_it",
        "position": 25,
        "bought": false
      },
      {
        "title": "Monopoly Sonic",
        "url": "https://www.amazon.fr/dp/B0DNMZVXW2/?coliid=I1RN8LMYDJR0QW&colid=D4JQHTB7962O&psc=1&ref_=list_c_wl_lv_ov_lig_dp_it",
        "position": 26,
        "bought": false
      },
      {
        "title": "Monopoly Appli Bancaire",
        "url": "https://www.amazon.fr/dp/B0F5WZKL6D/?coliid=IR1JG55N03BCT&colid=D4JQHTB7962O&psc=1&ref_=list_c_wl_lv_ov_lig_dp_it",
        "position": 27,
        "bought": false
      },
      {
        "title": "Monopoly Rue de la Soif",
        "url": "https://www.amazon.fr/dp/B0DSWCQX96/?coliid=I2TCC6EHDJDZJH&colid=D4JQHTB7962O&psc=1&ref_=list_c_wl_lv_ov_lig_dp_it",
        "position": 28,
        "bought": false
      },
      {
        "title": "George (Blind Test)",
        "url": "https://www.amazon.fr/dp/B0DXQDSXJS/?coliid=I3HHCGUAOI4DTW&colid=D4JQHTB7962O&psc=1&ref_=list_c_wl_lv_ov_lig_dp_it",
        "position": 29,
        "bought": false
      },
      {
        "title": "60\" Max",
        "url": "https://www.amazon.fr/dp/B0FN488S1X/?coliid=I1QJ2TDO9U70I4&colid=D4JQHTB7962O&psc=1&ref_=list_c_wl_lv_ov_lig_dp_it",
        "position": 30,
        "bought": false
      },
      {
        "title": "Uno Spin",
        "url": "https://www.amazon.fr/dp/B0DMWGFDTX/?coliid=I353JH2FWXAWEJ&colid=D4JQHTB7962O&psc=1&ref_=list_c_wl_lv_ov_lig_dp_it",
        "position": 31,
        "bought": false
      },
      {
        "title": "Liar's Uno",
        "url": "https://www.amazon.fr/dp/B0DMWGFDTX/?coliid=I353JH2FWXAWEJ&colid=D4JQHTB7962O&psc=1&ref_=list_c_wl_lv_ov_lig_dp_it",
        "position": 32,
        "bought": false
      },
      {
        "title": "Fort Boyard",
        "url": "https://www.amazon.fr/dp/B000TXRRQS/?coliid=I3BLOLTP9OCF07&colid=D4JQHTB7962O&psc=1&ref_=list_c_wl_lv_ov_lig_dp_it",
        "position": 33,
        "bought": false
      },
      {
        "title": "Stop The Robots",
        "url": "https://www.amazon.fr/dp/B08C3F24Y4/?coliid=I2PM8ZY6P505MH&colid=D4JQHTB7962O&psc=1&ref_=list_c_wl_lv_ov_lig_dp_it",
        "position": 34,
        "bought": false
      },
      {
        "title": "One More",
        "url": "https://www.amazon.fr/dp/B0DZCVR2FY/?coliid=I16GFZMN8785XT&colid=D4JQHTB7962O&psc=1&ref_=list_c_wl_lv_ov_lig_dp_it",
        "position": 35,
        "bought": false
      },
      {
        "title": "Mouton Mouton",
        "url": "https://www.amazon.fr/dp/B0FJSLMQNY/?coliid=I1DXFSQJED61AA&colid=D4JQHTB7962O&psc=1&ref_=list_c_wl_lv_ov_lig_dp_it",
        "position": 36,
        "bought": false
      },
      {
        "title": "Mille Bornes Sonic",
        "url": "https://www.amazon.fr/dp/B0D7J3LVHQ/?coliid=I19EJ9REWN8ZUB&colid=D4JQHTB7962O&psc=1&ref_=list_c_wl_lv_ov_lig_dp_it",
        "position": 37,
        "bought": false
      },
      {
        "title": "Peluche Monopoly",
        "url": "https://www.amazon.fr/dp/B0B1M9V4QM/?coliid=IHTC5NI0I2A4J&colid=D4JQHTB7962O&psc=1&ref_=list_c_wl_lv_ov_lig_dp_it",
        "position": 38,
        "bought": false
      },
      {
        "title": "Funko Pop Monopoly",
        "url": "https://www.amazon.fr/dp/B0DP78TRVZ/?coliid=IJ11M2AM0FEF3&colid=D4JQHTB7962O&psc=1&ref_=list_c_wl_lv_ov_lig_dp_it",
        "position": 39,
        "bought": false
      },
      {
        "title": "Smartbox catamaran Fort Boyard",
        "url": "https://www.smartbox.com/fr/nos-smartbox/sport-aventure/cap-vers-fort-boyard-balade-en-catamaran-durant-4h-en-duo-1438662.html",
        "position": 40,
        "bought": false
      },
      {
        "title": "Poster à gratter 100 choses à faire avant de mourir",
        "url": "https://www.cadomaestro.com/poster-100-choses-a-faire-dans-sa-vie-11288.html",
        "position": 41,
        "bought": false
      },
      {
        "title": "Carte de France à gratter",
        "url": "https://www.cadomaestro.com/carte-france-nouvelles-regions-gratter-9476.html",
        "position": 42,
        "bought": false
      },
      {
        "title": "Polo étoiles d'or 3XL",
        "url": "https://www.amazon.fr/dp/B0B28YZ8XJ/?coliid=IFK796FDSMAAA&colid=D4JQHTB7962O&psc=1&ref_=list_c_wl_lv_ov_lig_dp_it",
        "position": 43,
        "bought": false
      },
      {
        "title": "Chemise dorée 3XL",
        "url": "https://www.amazon.fr/dp/B075V41KBM/?coliid=IUGP6KKKUKHBV&colid=D4JQHTB7962O&psc=1&ref_=list_c_wl_lv_ov_lig_dp_it",
        "position": 44,
        "bought": false
      },
      {
        "title": "Chemise de bowling noir or 3XL",
        "url": "https://www.amazon.fr/dp/B0DXV8JZNY/?coliid=I4DIQI4P4AMIK&colid=D4JQHTB7962O&psc=1&ref_=list_c_wl_lv_ov_lig_dp_it",
        "position": 45,
        "bought": false
      },
      {
        "title": "Casque bluetooth Philips",
        "url": "https://www.amazon.fr/dp/B0CZRS76JR/?coliid=I1VA1NDVFORSDK&colid=D4JQHTB7962O&psc=1&ref_=list_c_wl_lv_ov_lig_dp_it",
        "position": 46,
        "bought": false
      },
      {
        "title": "Casque JBL (en promo en magasin Leclerc)",
        "url": "https://www.e.leclerc/fp/casque-sans-fil-jbl-tune-660-nc-noir-avec-son-jbl-pure-bass-et-suppression-active-du-bruit-6925281983306",
        "position": 47,
        "bought": false
      },
      {
        "title": "Streamdeck XL",
        "url": "https://www.amazon.fr/dp/B07RL8H55Z/?coliid=I3FFIJ09WPB6XG&colid=D4JQHTB7962O&psc=1&ref_=list_c_wl_lv_ov_lig_dp_it",
        "position": 48,
        "bought": false
      },
      {
        "title": "Mind Me",
        "url": "https://www.amazon.fr/dp/B0D4RBMQ83/?coliid=I1BHX6PYB0LZ4Q&colid=D4JQHTB7962O&psc=1&ref_=list_c_wl_lv_ov_lig_dp_it",
        "position": 49,
        "bought": false
      },
      {
        "title": "T-shirt Minecraft noir 3XL",
        "url": "https://www.amazon.fr/dp/B093RG999V/?coliid=I3BFYTXNCQBB10&colid=D4JQHTB7962O&customId=B07537YDZ2&customizationToken=MC_Assembly_1%23B07537YDZ2&th=1&psc=1",
        "position": 50,
        "bought": false
      },
      {
        "title": "T-shirt TV marron ou violet 3XL",
        "url": "https://www.amazon.fr/dp/B0CWXS391H/?coliid=IJBB201N4UT7A&colid=D4JQHTB7962O&customId=B0DR88G2JF&customizationToken=MC_Assembly_1%23B0DR88G2JF&th=1&psc=1",
        "position": 51,
        "bought": false
      },
      {
        "title": "Pantalon argenté ou doré 3XL",
        "url": "https://www.amazon.fr/dp/B0BKKPPFPX/?coliid=I19P7WV7BTQUIN&colid=D4JQHTB7962O&psc=1&ref_=list_c_wl_lv_ov_lig_dp_it",
        "position": 52,
        "bought": false
      },
      {
        "title": "T-shirt Monopoly noir ou vert forêt 3XL",
        "url": "https://www.amazon.fr/dp/B08LNZG4MX/?coliid=I3DYKUMX99TAE6&colid=D4JQHTB7962O&customId=B0DR87LPY8&customizationToken=MC_Assembly_1%23B0DR87LPY8&th=1&psc=1",
        "position": 53,
        "bought": false
      },
      {
        "title": "T-shirt 404 motivation noir ou asphalte 3XL",
        "url": "https://www.amazon.fr/Message-derreur-Motivation-introuvable-T-Shirt/dp/B0FGD99S67/ref=sr_1_16?__mk_fr_FR=%C3%85M%C3%85%C5%BD%C3%95%C3%91&crid=3DQY5F9DLJB58&dib=eyJ2IjoiMSJ9.dSjpsjYRAjARf0uER8i6ozVo3aeMQ9BULGg4v6WzPyRQdBVa1hcWPwFuQZE25lvoxHWlkMRTmtV0CkOIWkUFD767JC2SbVHxJgLDZC0G0UJoVeaMgFf25BNavl8d-W90ocdNbgzACxe1fsLDJNBLvtoA3Vj8uITPQ8jyPx_gw2QOAS03IqGrcYjkGR9HLUiEouOBML9Vm6k6SiRlcjKKwO_iYbo6IeagSi50k3arJGTWsU85i2L0aCoZMdkX32wy2Ctbly0j11Op35dMYeOnCxKf5A4Tgcj6HH_0bAuH6Rc.GE-wCtyfmip2FzUKvO1xzafNDP3vmTqKXEG35Z3MA1s&dib_tag=se&keywords=t-shirt%2Berreur%2B404%2Bmotivation&qid=1765470361&sprefix=t-shirt%2Berreur%2B404%2Bmotivation%2Caps%2C94&sr=8-16&customId=B07537YDZ2&customizationToken=MC_Assembly_1%23B07537YDZ2&th=1&psc=1",
        "position": 54,
        "bought": false
      },
      {
        "title": "T-shirt TKT je gère noir 3XL",
        "url": "https://www.amazon.fr/Cadeau-Humour-Original-TINQUI%C3%88TE-T-Shirt/dp/B0FSDT7RK2/ref=sr_1_73_sspa?__mk_fr_FR=%C3%85M%C3%85%C5%BD%C3%95%C3%91&crid=3BEBK285DI9JS&dib=eyJ2IjoiMSJ9.4u9wDXjwhOfD2hslvzvxU_hilgHWeIcJ4nbZACzt7OmIbdMbnL9uTqHetZZZRpIJ7tqr1PLvewavqh63YetGMSihWY6v2ZJfoSoDGvucF-h-yYSTAPWLRv028Irb3tXsuQobIw_abC-rjaYdtkOI14ZxtTD8D6gAryRAtzmpB3c89PjKK4XSgSc5kJLa6xi23l0X2Tr_dh53zJvTiQXNRAGBcjkTdqj6WTM9aD3LNCmuFnWIvdkzV0IcukyRKa_Xh7A8BRSyrFZOCeqFd417RNw7L1ZC60glDkZWYoTN1ro.Lju3PqqCjI5aU9DdCcZWa8IxuD7MCp-Ry5YMZRbIIEU&dib_tag=se&keywords=t-shirt%2Berreur%2B404&qid=1765470249&sprefix=t-shirt%2Berreur%2B404%2Caps%2C111&sr=8-73-spons&xpid=H00tuSdbtOnjj&aref=bR7HfVRYvt&sp_csd=d2lkZ2V0TmFtZT1zcF9tdGY&customId=B07537YDZ2&customizationToken=MC_Assembly_1%23B07537YDZ2&th=1&psc=1",
        "position": 55,
        "bought": false
      },
      {
        "title": "Peluche Alien Toy Story (grappppppin)",
        "url": "https://www.amazon.fr/dp/B0BGWQ94XJ/?coliid=I2XHOAUDZIQZP4&colid=D4JQHTB7962O&psc=1&ref_=list_c_wl_lv_ov_lig_dp_it",
        "position": 56,
        "bought": false
      },
      {
        "title": "Peluche Woody Toy Story",
        "url": "https://www.amazon.fr/dp/B0BGXDR1KF/?coliid=I3F6YME4BQSSB3&colid=D4JQHTB7962O&psc=1&ref_=list_c_wl_lv_ov_lig_dp_it",
        "position": 57,
        "bought": false
      },
      {
        "title": "Scrabble Surprise",
        "url": "https://www.amazon.fr/dp/B09QXT6KGW/?coliid=I183M7C2X7YALF&colid=D4JQHTB7962O&psc=1&ref_=list_c_wl_lv_ov_lig_dp_it",
        "position": 58,
        "bought": false
      },
      {
        "title": "Kirby et le monde oublié",
        "url": "https://www.amazon.fr/dp/B09QH87JC3/?coliid=I27Q6OKTA3N30D&colid=D4JQHTB7962O&psc=1&ref_=list_c_wl_lv_ov_lig_dp_it",
        "position": 59,
        "bought": false
      },
      {
        "title": "La Bonne Paye réédition 2025",
        "url": "https://www.amazon.fr/dp/B0CKXQN88L/?coliid=IXG3LDZNSE01Q&colid=D4JQHTB7962O&psc=1",
        "position": 60,
        "bought": false
      },
      {
        "title": "Jeu du LOGO et des marques revisité",
        "url": "https://www.amazon.fr/dp/B0D9HGYDKC/?coliid=IFVDAU4A31VNG&colid=D4JQHTB7962O&psc=1",
        "position": 61,
        "bought": false
      },
      {
        "title": "Machine à sous",
        "url": "https://www.amazon.fr/dp/B076H7BV6K/?coliid=I13XAY9UZ9GYTH&colid=D4JQHTB7962O&psc=1&ref_=list_c_wl_lv_ov_lig_dp_it",
        "position": 62,
        "bought": false
      },
      {
        "title": "Triominos Electronique",
        "url": "https://www.amazon.fr/dp/B07C9D8T1Z/?coliid=I5EW4SB4J0V07&colid=D4JQHTB7962O&psc=0&ref_=list_c_wl_lv_ov_lig_dp_it",
        "position": 63,
        "bought": false
      },
      {
        "title": "Triominos voyage",
        "url": "https://www.amazon.fr/dp/B005X4TDSI/?coliid=I11E517V0OO0DQ&colid=D4JQHTB7962O&psc=1&ref_=list_c_wl_lv_ov_lig_dp_it",
        "position": 64,
        "bought": false
      },
      {
        "title": "Time Bomb + High Risk",
        "url": "https://www.amazon.fr/dp/B0B2S1D4MW/?coliid=I2WLNU51203U5Q&colid=D4JQHTB7962O&psc=1&ref_=list_c_wl_lv_ov_lig_dp_it",
        "position": 65,
        "bought": false
      },
      {
        "title": "Pékin Express + Le Flambeur",
        "url": "https://www.amazon.fr/dp/B0BZS8YLSM/?coliid=I8HZ81YSNIU7E&colid=D4JQHTB7962O&psc=0&ref_=list_c_wl_lv_ov_lig_dp_it",
        "position": 66,
        "bought": false
      },
      {
        "title": "Trépied téléphone + anneau lumineux",
        "url": "https://www.amazon.fr/dp/B09ZNNY165/?coliid=I3M9U8AMQH7W5K&colid=D4JQHTB7962O&psc=1&ref_=list_c_wl_lv_ov_lig_dp_it",
        "position": 67,
        "bought": false
      },
      {
        "title": "Peluche Fall Guys",
        "url": "https://www.amazon.fr/dp/B099KTT2K9/?coliid=I2AMVT71PGLETN&colid=D4JQHTB7962O&th=1",
        "position": 68,
        "bought": false
      },
      {
        "title": "Jeu de cartes Fort Boyard",
        "url": "https://www.amazon.fr/dp/2821215320/?coliid=IDQNI14BZ293C&colid=D4JQHTB7962O&psc=0&ref_=list_c_wl_lv_ov_lig_dp_it",
        "position": 69,
        "bought": false
      },
      {
        "title": "Lampe D personnalisée Didiprod",
        "url": "https://www.amazon.fr/dp/B08KXR5ZX5/?coliid=I6XPGMCFK5P0Y&colid=D4JQHTB7962O&psc=1&customId=AAAAAAAAAQBIQqX67JDKs5tTxsbRLhC1gAAAAAAAAACzi6OUUrnop2sV55dJHnvZ%252FBCTK3J0abj4zr1hIK6T9F6VaDy2iBrx4%252BKsBrQIKHd8JiQy3SzOaVeuyHzDazOdVsgJIRoQpp69HcW0W2JU5n6W7EOk%252BgYa0QGX6gSz%252FudTtp7DOuYH6g6GzIE4jSbcKRLe%252FnDnNweOgGf4YrEy8A%253D%253D&ref_=list_c_wl_lv_ov_lig_dp_it",
        "position": 70,
        "bought": false
      },
      {
        "title": "Uno Minecraft",
        "url": "https://www.amazon.fr/dp/B074RCV4HQ/?coliid=I1MZ2GFWL8T847&colid=D4JQHTB7962O&psc=1&ref_=list_c_wl_lv_ov_lig_dp_it",
        "position": 71,
        "bought": false
      },
      {
        "title": "Panneau lumineux ON AIR",
        "url": "https://www.amazon.fr/dp/B09PBKMYQM/?coliid=I3QEL960AGFHI1&colid=D4JQHTB7962O&psc=1&ref_=list_c_wl_lv_ov_lig_dp_it",
        "position": 72,
        "bought": false
      },
      {
        "title": "Album Orelsan La fuite en avant",
        "url": "https://www.amazon.fr/dp/B0FXY6P39M/?coliid=I372D7PKSOWDVW&colid=D4JQHTB7962O&psc=1&ref_=list_c_wl_lv_ov_lig_dp_it",
        "position": 73,
        "bought": false
      },
      {
        "title": "Puzzle Mario Kart 500 pièces",
        "url": "https://www.amazon.fr/dp/B0B3DLVQQ8/?coliid=IJFAYV6OEZ9JV&colid=D4JQHTB7962O&psc=0&ref_=list_c_wl_lv_ov_lig_dp_it",
        "position": 74,
        "bought": false
      },
      {
        "title": "Puzzle Toy Story 1000 pièces",
        "url": "https://www.amazon.fr/dp/B07PHGLCPQ/?coliid=IVU7XTTIC5JUJ&colid=D4JQHTB7962O&psc=1&ref_=list_c_wl_lv_ov_lig_dp_it",
        "position": 75,
        "bought": false
      },
      {
        "title": "Puzzle Mickey Mouse 1000 pièces",
        "url": "https://www.amazon.fr/dp/B08KF5GKNR/?coliid=ICINCSY6B23O6&colid=D4JQHTB7962O&psc=1&ref_=list_c_wl_lv_ov_lig_dp_it",
        "position": 76,
        "bought": false
      },
      {
        "title": "Just Dance 2020 version WII uniquement",
        "url": null,
        "position": 77,
        "bought": false
      },
      {
        "title": "Switch The Cube",
        "url": "https://www.amazon.fr/dp/B0BJ2QSJT8/?coliid=I2RQKQ3EYIPMIS&colid=D4JQHTB7962O&psc=1&ref_=list_c_wl_lv_ov_lig_dp_it",
        "position": 78,
        "bought": false
      },
      {
        "title": "Puissance 4 Shots",
        "url": "https://www.amazon.fr/dp/B07G41RHLH/?coliid=I1HO753EJ6MM8Q&colid=D4JQHTB7962O&psc=1&ref_=list_c_wl_lv_ov_lig_dp_it",
        "position": 79,
        "bought": false
      },
      {
        "title": "Switch Super Monkey Ball",
        "url": "https://www.amazon.fr/dp/B097M6F6NN/?coliid=I2T60GP9LHTPL1&colid=D4JQHTB7962O&th=1",
        "position": 80,
        "bought": false
      },
      {
        "title": "Puzzle Fort Boyard 1000 pièces",
        "url": "https://www.amazon.fr/dp/B07WDM9VDK/?coliid=I25TK2NK2BS6ON&colid=D4JQHTB7962O&psc=1&ref_=list_c_wl_lv_ov_lig_dp_it",
        "position": 81,
        "bought": false
      },
      {
        "title": "Fun Facts",
        "url": "https://www.amazon.fr/dp/B0BFDQLNN8/?coliid=I3VY1Z0R97OTI0&colid=D4JQHTB7962O&psc=1&ref_=list_c_wl_lv_ov_lig_dp_it",
        "position": 82,
        "bought": false
      },
      {
        "title": "Left Right Dilemma",
        "url": "https://www.amazon.fr/dp/B0BGHNMWYG/?coliid=I2Q6YSFINVD5P8&colid=D4JQHTB7962O&psc=1&ref_=list_c_wl_lv_ov_lig_dp_it",
        "position": 83,
        "bought": false
      },
      {
        "title": "Dinner in Paris",
        "url": "https://www.philibertnet.com/fr/funnyfox/89888-dinner-in-paris-3616450000018.html",
        "position": 84,
        "bought": false
      },
      {
        "title": "Uno Quatro",
        "url": "https://www.amazon.fr/dp/B0BBSTD699/?coliid=I1S3IYASJ3DV3&colid=D4JQHTB7962O&th=1",
        "position": 85,
        "bought": false
      },
      {
        "title": "Switch Rollercoaster Tycoon Adventure Deluxe",
        "url": "https://www.amazon.fr/dp/B0C9QTHL9P/?coliid=I2R54PTJ3P8CK4&colid=D4JQHTB7962O&th=1",
        "position": 86,
        "bought": false
      },
      {
        "title": "Streamdeck Neo",
        "url": "https://www.amazon.fr/dp/B0FBS6X4NX/?coliid=IIPZ55PZ4IL6D&colid=D4JQHTB7962O&psc=1&ref_=list_c_wl_lv_ov_lig_dp_it",
        "position": 87,
        "bought": false
      },
      {
        "title": "Switch Professeur Rubik's Entraînement Cérébral",
        "url": "https://www.amazon.fr/dp/B08H2K1R73/?coliid=I33SKI88USCGSD&colid=D4JQHTB7962O&th=1",
        "position": 88,
        "bought": false
      },
      {
        "title": "Switch Fort Boyard les défis du Père Fouras",
        "url": "https://www.amazon.fr/dp/B0CZ14VTWK/?coliid=IBZ0GA7W4WV3T&colid=D4JQHTB7962O&psc=1&ref_=list_c_wl_lv_ov_lig_dp_it",
        "position": 89,
        "bought": false
      },
      {
        "title": "Manettes Joy-Con Switch bleu/jaune ou rose/jaune pastel ou violet/vert pastel",
        "url": "https://www.amazon.fr/dp/B07VFTVVWX/?coliid=IZSKUACEBDLI1&colid=D4JQHTB7962O&psc=1&ref_=list_c_wl_lv_ov_lig_dp_it",
        "position": 90,
        "bought": false
      },
      {
        "title": "Support Joy-Con grip",
        "url": null,
        "position": 91,
        "bought": false
      },
      {
        "title": "Mélangeur de cartes",
        "url": "https://www.amazon.fr/dp/B08FR39RKM/?coliid=I3O4611GAISJLM&colid=D4JQHTB7962O&psc=1&ref_=list_c_wl_lv_ov_lig_dp_it",
        "position": 92,
        "bought": false
      },
      {
        "title": "Puzzle Super Mario 1000 pièces",
        "url": "https://www.amazon.fr/dp/B0CQ82VY6N/?coliid=I15F3Q39FKX7P9&colid=D4JQHTB7962O&th=1",
        "position": 93,
        "bought": false
      },
      {
        "title": "Puzzle Les Goonies 500 pièces",
        "url": "https://www.amazon.fr/dp/B09S7JPYXV/?coliid=I2B7UMXUTTOWRM&colid=D4JQHTB7962O&th=1",
        "position": 94,
        "bought": false
      },
      {
        "title": "Puzzle Among Us 1000 pièces",
        "url": "https://www.amazon.fr/dp/B09CYMP3RW/?coliid=IP53207BGSB6Q&colid=D4JQHTB7962O&th=1",
        "position": 95,
        "bought": false
      },
      {
        "title": "Coussin Minecraft",
        "url": "https://www.amazon.fr/dp/B087G1WFDT/?coliid=I262VYZG67S89T&colid=D4JQHTB7962O&psc=1",
        "position": 96,
        "bought": false
      },
      {
        "title": "Peluche loup Minecraft",
        "url": "https://www.amazon.fr/HaOrchid-Peluche-M%C3%A9chant-Anniversaire-D%C3%A9coration/dp/B0DQL8Z28Z/ref=sr_1_3?__mk_fr_FR=%C3%85M%C3%85%C5%BD%C3%95%C3%91&crid=21KU6BPRKX6I0&dib=eyJ2IjoiMSJ9.tbINDhLLRIW938YbLMMwUVtYWa490Q9nkbbJFuwZ2I_vOhonf11d4NH8vBYgwuC36FFjj5dhXkeoXPfaKch5wNAEZJpiZ_ko0efp1N45f6fGl9cxCXjD4EQ42beVbl3ARcTVi3Uno290a2ydGA5ZU3PSDRIPtbc8HQvlmJlgWvWEn2TzaKA74YL_hH0mgC7NxK-8y1JjwTG97-hB-M-AzjtAyU-0ilz93oD8OwYwxyKVcIoOsPjlgHVJHML1P3J4SkUecW2YO5PHxIFiqZ3KYVdiG8ACMdosYE-YyMiTjZs.W7vFYOTZy5ampQHi3HytqZWYdNhkR33gQofCDRSFF0Y&dib_tag=se&keywords=peluche+loup+minecraft&qid=1765472411&s=toys&sprefix=peluche+loup+minecraft%2Ctoys%2C107&sr=1-3",
        "position": 97,
        "bought": false
      },
      {
        "title": "Peluche Goomba Mario",
        "url": "https://www.amazon.fr/dp/B071XPT697/?coliid=I2W071OJGBJI85&colid=D4JQHTB7962O&psc=1",
        "position": 98,
        "bought": false
      },
      {
        "title": "Peluche Toad Mario",
        "url": "https://www.amazon.fr/dp/B071X9GQSP/?coliid=I30MJ5R3XUGP2G&colid=D4JQHTB7962O&psc=1",
        "position": 99,
        "bought": false
      },
      {
        "title": "Peluche Boo Mario",
        "url": "https://www.amazon.fr/dp/B00OASUSDM/?coliid=I12BUVET5GFSVN&colid=D4JQHTB7962O&th=1",
        "position": 100,
        "bought": false
      },
      {
        "title": "Peluche enderman Minecraft",
        "url": "https://www.amazon.fr/Minecraft-HLN11-Minecraft-Peluche-Multicolour/dp/B0BCP4L6NY/ref=sr_1_10?__mk_fr_FR=%C3%85M%C3%85%C5%BD%C3%95%C3%91&crid=2CCNZB7IKH26N&dib=eyJ2IjoiMSJ9.cse1TZBw70mJqH4tMsKGLABlI1L7IRkmW0aTqkAKV1ZqPMkW9RH8trt7PY0S9vOnXiUxjjZ2g4caeTskEojHgqOf0loGtRkePz3_HRGvM2JQJQ7Hxr2Ok0nl1IGQZtm4cmuAd_b-9pCtaQB02PJHsvF8x5BXOgDKWLnnxuGLoMPnNiLGPy2jGoUeIO1yCMOaHU56bDylZIW5d1i3DFKEH2eOab9HsITaCNJ7eHttYWZvy0wThdLk9sik53pYD_I5Ix94VqCJ585_7rieYvai4CYsOEacLJhaTMjV4azVYM0.IJLfz77ySAOqoswe4krJuknNNztmSU0KEIR0CTyWEuw&dib_tag=se&keywords=peluche%2Bminecraft%2Bpiglin&qid=1765472525&s=toys&sprefix=peluche%2Bminecraft%2Bpiglin%2Ctoys%2C104&sr=1-10&th=1",
        "position": 101,
        "bought": false
      },
      {
        "title": "Peluche ozelot Minecraft",
        "url": "https://www.amazon.fr/Minecraft-16534-Peluche-B%C3%A9b%C3%A9-Ocelot/dp/B00HUMLFXM/ref=sr_1_19?__mk_fr_FR=%C3%85M%C3%85%C5%BD%C3%95%C3%91&crid=2CCNZB7IKH26N&dib=eyJ2IjoiMSJ9.cse1TZBw70mJqH4tMsKGLABlI1L7IRkmW0aTqkAKV1ZqPMkW9RH8trt7PY0S9vOnXiUxjjZ2g4caeTskEojHgqOf0loGtRkePz3_HRGvM2JQJQ7Hxr2Ok0nl1IGQZtm4cmuAd_b-9pCtaQB02PJHsvF8x5BXOgDKWLnnxuGLoMPnNiLGPy2jGoUeIO1yCMOaHU56bDylZIW5d1i3DFKEH2eOab9HsITaCNJ7eHttYWZvy0wThdLk9sik53pYD_I5Ix94VqCJ585_7rieYvai4CYsOEacLJhaTMjV4azVYM0.IJLfz77ySAOqoswe4krJuknNNztmSU0KEIR0CTyWEuw&dib_tag=se&keywords=peluche%2Bminecraft%2Bpiglin&qid=1765472525&s=toys&sprefix=peluche%2Bminecraft%2Bpiglin%2Ctoys%2C104&sr=1-19&th=1",
        "position": 102,
        "bought": false
      },
      {
        "title": "Peluche bébé zombie poulet Minecraft",
        "url": "https://www.amazon.fr/Mattel-Minecraft-collection-inspir%C3%A9e-personnage/dp/B0FDDVL4J3/ref=sr_1_25_mod_primary_new?__mk_fr_FR=%C3%85M%C3%85%C5%BD%C3%95%C3%91&crid=2CCNZB7IKH26N&dib=eyJ2IjoiMSJ9.cse1TZBw70mJqH4tMsKGLABlI1L7IRkmW0aTqkAKV1ZqPMkW9RH8trt7PY0S9vOnXiUxjjZ2g4caeTskEojHgqOf0loGtRkePz3_HRGvM2JQJQ7Hxr2Ok0nl1IGQZtm4cmuAd_b-9pCtaQB02PJHsvF8x5BXOgDKWLnnxuGLoMPnNiLGPy2jGoUeIO1yCMOaHU56bDylZIW5d1i3DFKEH2eOab9HsITaCNJ7eHttYWZvy0wThdLk9sik53pYD_I5Ix94VqCJ585_7rieYvai4CYsOEacLJhaTMjV4azVYM0.IJLfz77ySAOqoswe4krJuknNNztmSU0KEIR0CTyWEuw&dib_tag=se&keywords=peluche+minecraft+piglin&qid=1765472525&s=toys&sbo=RZvfv%2F%2FHxDF%2BO5021pAnSA%3D%3D&sprefix=peluche+minecraft+piglin%2Ctoys%2C104&sr=1-25",
        "position": 103,
        "bought": false
      },
      {
        "title": "Peluche Buzz ou Sox",
        "url": "https://www.amazon.fr/dp/B0B6CJ88R7/?coliid=I437RLGUF1QKZ&colid=D4JQHTB7962O&th=1",
        "position": 104,
        "bought": false
      },
      {
        "title": "Peluche Patrick l'étoile de mer (y en a 2 peu importe)",
        "url": "https://www.amazon.fr/Simba-Patricio-rembourrage-officielle-109491002SPB/dp/B0BQ742ZGC/ref=sr_1_19_mod_primary_new?__mk_fr_FR=%C3%85M%C3%85%C5%BD%C3%95%C3%91&crid=26U82A57JOHZX&dib=eyJ2IjoiMSJ9.dPh4FzQgCy_2z6wLGrPsaw7oidNtYVxpzXpJDOvBNA74q6PDcVB-fEOVkLWhpy1fp55SsDbCUbQxFQn04xP9yv0H8YChc2KFAbOpzriesDUCcx2GcPVoOYhciAVq0YKZJLGugsBV9fx9Yo09aNTUUuNmfOFQdeqQjk3Bn2_7JjIWI6FuLmDY7vFtlo469vOhI_I7TKKu7R8FSu6yowPYfCkRTREug0ecoWXSCIjuUAq1qvGhOwj5pMiaGfFnoBlxlusoGJjAI-ZnGDi5a0tbYIpITXknX3__t_a4twC_9So.TuLk4hpU2S6BczA9cbche4pxGdWUtKyqPTEUrJ6yalI&dib_tag=se&keywords=peluche%2Bbob%2Bl%27%C3%A9ponge&qid=1765472876&s=toys&sbo=RZvfv%2F%2FHxDF%2BO5021pAnSA%3D%3D&sprefix=peluche%2Bbob%2Bl%27%C3%A9pong%2Ctoys%2C116&sr=1-19&th=1",
        "position": 105,
        "bought": false
      },
      {
        "title": "Peluche Carlos calamar",
        "url": "https://www.amazon.fr/Simba-109491002SQU-Peluche/dp/B0BZYZLWMS/ref=sr_1_1?__mk_fr_FR=%C3%85M%C3%85%C5%BD%C3%95%C3%91&crid=2T8LNLS66B336&dib=eyJ2IjoiMSJ9.0vTrSXBLyV6qkc7lQ9qC3D_tcv7rADMGw15Ric6HZWFX35cFAYbGXA-_4T6XwlgxOEyid4BtmbjXtiPmB8UQtNyoWCJnreX87_e6V_xDy_vGqmVKLoZSixapI2ryf0ui2SSVJ4Rm7zFxO5H5rXzX7dQgZoi31JVNe2H9Dy9sF4hVUkjyIBjwStH-3BSDKLZkqtKtC6gV3k655AHcUIAFNjiGcZPoNrnKABRTkpr9m8yhl5pinSX-EbY-S3gRfnL6GfmZCkk1uJUxA1eW18B4tL2262BB_R9RgfJb-sdeYtw.9Fsyl5l4G9MCFrI-lCPdA-ZbRhWD6JjHWsw3H6MlyCI&dib_tag=se&keywords=peluche+bob+l%27%C3%A9ponge+carlos&qid=1765473031&s=toys&sprefix=peluche+bob+l%27%C3%A9ponge+carlos%2Ctoys%2C100&sr=1-1",
        "position": 106,
        "bought": false
      },
      {
        "title": "Peluche Shaun le mouton",
        "url": "https://www.amazon.fr/dp/B0853S9R8J/?coliid=I3I4IXFLLCNHNA&colid=VRYMPF63SY63&th=1",
        "position": 107,
        "bought": false
      },
      {
        "title": "Peluche Diddy Kong Mario",
        "url": "https://www.amazon.fr/Sanei-Peluche-Diddy-Kong/dp/B07HBJ82JN/ref=pd_bxgy_d_sccl_1/520-2657181-8777336?pd_rd_w=wh2H4&content-id=amzn1.sym.a90d25b2-fd53-4a48-85ae-177bd74a3a1c&pf_rd_p=a90d25b2-fd53-4a48-85ae-177bd74a3a1c&pf_rd_r=WD3AFZ6N28XK7HN6XDKX&pd_rd_wg=RpzEb&pd_rd_r=0afe39a9-1f3f-4c49-ad52-12d046733efc&pd_rd_i=B07HBJ82JN&psc=1",
        "position": 108,
        "bought": false
      }
    ]
  }
];

  for (let i = 0; i < listsData.length; i++) {
    const listDef = listsData[i];

    // Résolution du propriétaire si le compte existe déjà en base
    let ownerId = null;
    if (listDef.ownerEmail) {
      try {
        const existingUser = app.findFirstRecordByFilter('users', 'email = {:email}', { email: listDef.ownerEmail });
        ownerId = existingUser.id;
      } catch {
        ownerId = null;
      }
    }

    let listRecord = null;
    try {
      listRecord = app.findFirstRecordByFilter('lists', 'slug = {:slug}', { slug: listDef.slug });
      listRecord.set('title', listDef.title);
      if (ownerId) {
        listRecord.set('owner', ownerId);
      }
      app.save(listRecord);
    } catch {
      listRecord = new Record(listsCol);
      listRecord.set('slug', listDef.slug);
      listRecord.set('title', listDef.title);
      if (ownerId) {
        listRecord.set('owner', ownerId);
      }
      app.save(listRecord);
    }

    // Nettoyage préalable des cadeaux de la liste pour garantir l'idempotence exacte
    try {
      const existingGifts = app.findRecordsByFilter('gifts', 'list = {:listId}', '', 0, 0, { listId: listRecord.id });
      for (let j = 0; j < existingGifts.length; j++) {
        app.delete(existingGifts[j]);
      }
    } catch {}

    // Insertion des cadeaux
    for (let j = 0; j < listDef.gifts.length; j++) {
      const g = listDef.gifts[j];
      const giftRecord = new Record(giftsCol);
      giftRecord.set('list', listRecord.id);
      giftRecord.set('title', g.title);
      if (g.url) {
        giftRecord.set('url', g.url);
      }
      giftRecord.set('position', g.position);
      giftRecord.set('bought', g.bought);
      app.save(giftRecord);
    }
  }
}, (app) => {
  // Rollback : suppression des listes et cadeaux de prod
  const slugs = ["-OgCMBHS1GiKdXMdpJnK","cadeaux-jimmy","deborah","joyeux-nowel","noel-2025-andy"];
  for (let i = 0; i < slugs.length; i++) {
    try {
      const listRecord = app.findFirstRecordByFilter('lists', 'slug = {:slug}', { slug: slugs[i] });
      app.delete(listRecord);
    } catch {}
  }
});
