# -*- coding: utf-8 -*-
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import matplotlib
import os
import sys
import re
import math
import urllib.request
import datetime
import time
from datetime import timedelta
from pytrends.request import TrendReq
import csv
import pylab as pl
from numpy import fft
import xmltodict, json
import requests
from bs4 import BeautifulSoup
import matplotlib.patches as mpatches
from flask import *

app = Flask(__name__)
@app.route('/success/<graph>')
def success(graph):
    return 'welcome %s' % graph
@app.route("/stock", methods=['POST','GET'])
def root():
    if request.method == 'POST':
        corp = request.form['stocks']
    else:
        corp = request.args.get('stocks')


    plt.rc('font', family='NanumGothic')
    matplotlib.rcParams['axes.unicode_minus'] = False


    whwjf = 2  # 그래프 상하 조절

    vudgod = 0  # 날짜 차이 조절

    rogud = 18  # 그래프 개형 강도

    skfWk = 100  # 분석 일수

    zmrl = 20  # 떡상 정도



    client_id = "QkgXYjmL8Q6eJSYdZCD2"
    client_secret = "XpL4GHX_G1"
    ourl = "https://openapi.naver.com/v1/datalab/search";


    def get_daily_stock_price(stockCode, name, count):
        url = f'https://fchart.stock.naver.com/sise.nhn?symbol={stockCode}&timeframe=day&count={count}&requestType=0'
        rs = requests.get(url)
        dt = xmltodict.parse(rs.text)
        js = json.dumps(dt, indent=4)
        js = json.loads(js)
        data = pd.json_normalize(js['protocol']['chartdata']['item'])
        df = data['@data'].str.split('|', expand=True)
        df.columns = ['날짜', 'open', 'high', 'low', '종가', 'Volume']

        df['이름'] = str(name)

        return df


    def fourierExtrapolation(x, n_predict):
        n = x.size
        n_harm = 100  # number of harmonics in model
        t = np.arange(0, n)
        p = np.polyfit(t, x, 1)  # find linear trend in x
        x_notrend = x - p[0] * t  # detrended x
        x_freqdom = fft.fft(x_notrend)  # detrended x in frequency domain
        f = fft.fftfreq(n)  # frequencies
        indexes = range(n)
        # sort indexes by frequency, lower -> higher
        indexes = list(range(n))

        t = np.arange(0, n + n_predict)
        restored_sig = np.zeros(t.size)
        for i in indexes[:1 + n_harm * 2]:
            ampli = np.absolute(x_freqdom[i]) / n  # amplitude
            phase = np.angle(x_freqdom[i])  # phase
            restored_sig += ampli * np.cos(2 * np.pi * f[i] * t + phase)
        return restored_sig + p[0] * t


    def get_search_data(GroupName, setting_name=1, fromwhere=1):
        d = datetime.datetime.today()
        d = d - timedelta(days=1)
        endDate = d.strftime('%Y-%m-%d')

        d = d - timedelta(days=skfWk)
        startDate = d.strftime('%Y-%m-%d')
        print(startDate)
        groupName = GroupName
        if (setting_name == 2):
            groupName += " 주가"

        if (fromwhere == 1):
            body = '{\"startDate\":\"' + startDate + '\",\"endDate\":\"' + endDate + '\",\"timeUnit\":\"date\",\"keywordGroups\":[{\"groupName\":\"' + groupName + '\",\"keywords\":["' + groupName + '"]}]}';
            # print(body)
            request = urllib.request.Request(ourl)
            request.add_header("X-Naver-Client-Id", client_id)
            request.add_header("X-Naver-Client-Secret", client_secret)
            request.add_header("Content-Type", "application/json")
            response = urllib.request.urlopen(request, data=body.encode("utf-8"))
            rescode = response.getcode()
            if (rescode == 200):
                response_body = response.read()
                ans = response_body.decode(encoding="utf-8", errors="replace")
            else:
                print("Error Code:" + rescode)
                assert 1 == 2
            dic = {}
            ans = ans.split("{")
            for i in range(len(ans)):
                ans[i] = re.split(",|:|}", ans[i])
                if (len(ans[i]) < 4): continue;
                if (ans[i][0] == '"period"' and ans[i][2] == '"ratio"'):
                    if (float(ans[i][3]) == 0):
                        ans[i][3] = 1
                    dic[ans[i][1][1:11]] = float(ans[i][3])
            return dic
        elif (fromwhere == 2):
            pytrends = TrendReq(hl='ko', tz=540)
            keywords = [groupName]
            pytrends.build_payload(keywords, cat=0, timeframe='today 3-m', geo='KR', gprop='')
            getcompareinfo = pytrends.interest_over_time()
            dic = {}
            for i in getcompareinfo[groupName].index:
                if (getcompareinfo[groupName][i] == 0):
                    dic[str(i)[:10]] = 1
                else:
                    dic[str(i)[:10]] = getcompareinfo[groupName][i]
            ndic = {}
            nwday = d
            for i in dic:
                print(type(i), i)
            print("ASDASD")
            while True:
                print(d.strftime)
                ndic[d.strftime('%Y-%m-%d')] = dic[d.strftime('%Y-%m-%d')]
                d += timedelta(days=1)
                if (d.strftime('%Y-%m-%d') == endDate):
                    break;

            return ndic


    def delete_weekend(dic):
        ndic = {}

        for i in dic:
            d = datetime.datetime.strptime(i, '%Y-%m-%d')
            if (d.weekday() < 5):
                ndic[i] = dic[i]
        return ndic


    # 네이버 금융(http://finance.naver.com)에 넣어줌
    def get_url(item_name, code_df):
        code = code_df.query("name=='{}'".format(item_name))['code'].to_string(index=False).strip()
        url = 'http://finance.naver.com/item/sise_day.nhn?code={code}'.format(code=code)

        print("요청 URL = {}".format(url))
        return url


    code_df = pd.read_html('http://kind.krx.co.kr/corpgeneral/corpList.do?method=download&searchType=13', header=0)[0]

    # 종목코드가 6자리이기 때문에 6자리를 맞춰주기 위해 설정해줌
    code_df.종목코드 = code_df.종목코드.map('{:06d}'.format)

    # 우리가 필요한 것은 회사명과 종목코드이기 때문에 필요없는 column들은 제외해준다.
    code_df = code_df[['회사명', '종목코드']]

    # 한글로된 컬럼명을 영어로 바꿔준다.
    code_df = code_df.rename(columns={'회사명': 'name', '종목코드': 'code'})

    # 종목 이름을 입력하면 종목에 해당하는 코드를 불러와

    for item_name in corp:
        print(item_name)
        try:
            code = code_df.query("name=='{}'".format(item_name))['code'].to_string(index=False).strip()
            df = get_daily_stock_price(code, item_name, 100)
            df = df.dropna()
            dic = {}
            for i in df.index:
                date = df['날짜'][i]
                ndate = date[0:4] + '-' + date[4:6] + '-' + date[6:8]
                print(ndate, "asd")
                dic[ndate] = df['종가'][i]

            temp = delete_weekend(get_search_data(item_name))

            nwerr = 999999999999999

            for vudgod in range(-4, 6):
                whwjf = 0
                while whwjf <= 3:
                    whwjf += 0.2
                    abnormal_search = []
                    search_data = []
                    ind = []
                    day = []
                    day_calc = []
                    for i in temp:
                        try:
                            dic[i]
                            search_data.append(temp[i])
                            ind.append(i)
                        except KeyError:
                            pass
                    for i in range(8, len(search_data)):
                        recent_data = search_data[i - 8:i]
                        recent_data.sort()
                        median = (recent_data[3] + recent_data[4]) / 2
                        d = datetime.datetime.strptime(ind[i], '%Y-%m-%d')
                        cnt = 0

                        day_calc.append(d)
                        while cnt < 6:
                            d += timedelta(days=1)
                            if (d > datetime.datetime.today()):
                                if (d.weekday() < 5):
                                    cnt += 1
                                else:
                                    continue;
                            try:
                                dic[d.strftime('%Y-%m-%d')]
                                cnt += 1
                            except KeyError:
                                pass

                        day.append(str(d.month) + '\n' + str(d.day))
                        abnormal_search.append((np.log10(search_data[i] / median)))
                    # print(abnormal_search,len(abnormal_search))

                    price_difference = [0.1]
                    price_difference1 = [0]
                    price_difference2 = [0]

                    stock_price = []

                    stock_price.append(
                        int(dic[(day_calc[0] - timedelta(4 - max(day_calc[0].weekday(), 4))).strftime('%Y-%m-%d')]))

                    for i in range(len(day)):
                        # print(day_calc[i].strftime('%Y-%m-%d'))
                        stock_price.append(int(dic[day_calc[i].strftime('%Y-%m-%d')]))


                    for i in range(8, len(stock_price)):
                        recent_data = []
                        sum = 0
                        for j in range(i - 8, i):
                            sum += stock_price[j]
                        price_difference.append(
                            ((stock_price[i] - sum / 8) / (sum / 8)) * whwjf)  ########################################
                        for j in range(i - 8, i):
                            recent_data.append(stock_price[j])
                        recent_data.sort()
                        median = (recent_data[3] + recent_data[4]) / 2
                        price_difference1.append(((stock_price[i] - median) / (median)) * 3)
                        price_difference2.append(((stock_price[i] - stock_price[i - 1]) / stock_price[i - 1]) * 3)

                    stock_price = stock_price[8:]

                    for i in range(len(stock_price)):
                        while stock_price[i] > 0.1:
                            stock_price[i] *= 0.1

                    for i in range(7, len(abnormal_search) - 1):
                        k = (abs(price_difference[i - 7]) + abs(price_difference[i - 6]) + abs(price_difference[i - 5])) / 3
                        m = max([(price_difference[i - 7]), (price_difference[i - 6]), (price_difference[i - 5])])
                        l = max([abs(price_difference[i - 7]), abs(price_difference[i - 6]), abs(price_difference[i - 5])])
                        p = (price_difference[i - 6] - price_difference[i - 5]) / price_difference[i - 5]
                        if abnormal_search[i] >= 0:
                            abnormal_search[i] *= (1 / k) / zmrl

                        # abnormal_search[i] *= (1/abs(m))/20
                        # abnormal_search[i] *= (1/l)/20
                        # abnormal_search[i] *= (1/np.log10(abs(p)))/5

                    abnormal_search = abnormal_search[7 - vudgod:]
                    price_difference = price_difference[
                                       7:]  ###########################################################################
                    # day = day[7-vudgod:len(day)-vudgod]
                    day = day[7:]
                    cnt = 0

                    mean = 0
                    var = 0
                    for i in range(len(abnormal_search)):
                        mean += abnormal_search[i]
                    mean = mean / len(abnormal_search)
                    for i in range(len(abnormal_search)):
                        var += (mean - abnormal_search[i]) ** 2
                    var = (var / len(abnormal_search)) ** 0.5
                    for i in range(len(abnormal_search)):
                        if abs(abnormal_search[i]) > mean + var:
                            if abnormal_search[i] > 0:
                                abnormal_search[i] = mean + var
                            else:
                                abnormal_search[i] = mean - var

                    mean = 0
                    var = 0
                    for i in range(1, len(abnormal_search)):
                        mean += abnormal_search[i] - abnormal_search[i - 1]
                    mean = mean / (len(abnormal_search) - 1)
                    for i in range(1, len(abnormal_search)):
                        var += (abnormal_search[i] - abnormal_search[i - 1] - mean) ** 2
                    var = (var / (len(abnormal_search) - 1)) ** 0.5
                    for i in range(1, len(abnormal_search)):
                        if abs(abnormal_search[i] - abnormal_search[i - 1]) > abs(mean) + var:
                            if abnormal_search[i] - abnormal_search[i - 1] > 0:
                                abnormal_search[i] = abnormal_search[i - 1] + mean + var
                            else:
                                abnormal_search[i] = -mean - var + abnormal_search[i - 1]

                    if (vudgod > 0):
                        fday = day[len(day) - 1]
                        fday = fday.split("\n")
                        fday_date = int(fday[1])
                        fday_month = int(fday[0])

                        d = datetime.datetime.today()
                        while not (d.day == fday_date and d.month == fday_month):
                            d += timedelta(days=1)

                        while cnt < vudgod:
                            d += timedelta(days=1)
                            if (d.weekday() < 5):
                                day.append(str(d.month) + '\n' + str(d.day))
                                cnt += 1
                            else:
                                continue;
                    else:
                        day = day[:len(day) + vudgod]

                    ckdl = len(stock_price) - len(price_difference)
                    stock_price = stock_price[ckdl - 1:]



                    sp = np.fft.fft(price_difference)
                    csp = np.copy(sp)
                    csp[rogud:-rogud] = 0
                    iffted_price_difference = np.fft.ifft(csp)

                    sp2 = np.fft.fft(abnormal_search)
                    csp2 = np.copy(sp2)
                    csp2[rogud:-rogud] = 0
                    iffted_abnormal_search = np.fft.ifft(csp2)

                    x = np.array(price_difference)
                    n_predict = 6 + vudgod
                    extrapolation = fourierExtrapolation(x, n_predict)


                    len_ext = len(extrapolation)

                    err_mean = 0
                    var_mean = 0
                    err = 0
                    for i in range(len_ext):
                        err_mean += (abs(extrapolation[i] - iffted_abnormal_search[i]))
                    err_mean = err_mean / len(day)
                    for i in range(len_ext):
                        var_mean += (abs(extrapolation[i] - iffted_abnormal_search[i])) ** 2
                    var_mean = (var_mean / len(day)) ** 0.5
                    for i in range(len_ext):

                        err += abs(abs(extrapolation[i] - iffted_abnormal_search[i]) - err_mean)

                    for i in range(1, len_ext):
                        if (iffted_abnormal_search[i] - iffted_abnormal_search[i - 1]) * (
                                extrapolation[i] - extrapolation[i - 1]) >= 0:
                            err -= 5 / len(day)

                    err_mean = 0
                    var_mean = 0
                    for i in range(1, len_ext):
                        err_mean += abs((iffted_abnormal_search[i] - iffted_abnormal_search[i - 1]) - (
                                    extrapolation[i] - extrapolation[i - 1]))
                    err_mean = err_mean / len(day)
                    for i in range(1, len_ext):
                        var_mean += (abs((iffted_abnormal_search[i] - iffted_abnormal_search[i - 1]) - (
                                    extrapolation[i] - extrapolation[i - 1])) - err_mean) ** 0.5
                    var_mean = (var_mean / len(day)) ** 0.5
                    for i in range(1, len_ext):

                        err += abs(abs((iffted_abnormal_search[i] - iffted_abnormal_search[i - 1]) - (
                                    extrapolation[i] - extrapolation[i - 1])) - err_mean)



                    if (err < nwerr):
                        nwerr = err
                        nw_extrapolation = extrapolation
                        nw_iffted_abnormal_search = iffted_abnormal_search
                        nw_price_difference = price_difference
                        nw_day = day

                        print(nwerr)


            temp = [0 for i in range(len(nw_iffted_abnormal_search))]
            radius = 3
            bias = [1, 0.8, 0.2, 0.1]
            for i in range(len(nw_iffted_abnormal_search)):
                add = 0
                counter = 0
                for j in range(-radius, radius + 1):
                    try:
                        add += nw_iffted_abnormal_search[i + j] * bias[abs(j)]
                        counter += bias[abs(j)]
                    except IndexError:
                        pass
                temp[i] = add / counter

            # nw_iffted_abnormal_search = [0, 0] + temp[:-2]

            extrapolation = nw_extrapolation
            iffted_abnormal_search = nw_iffted_abnormal_search
            price_difference = nw_price_difference
            day = nw_day

            plt.style.use('bmh')
            fig, ax = plt.subplots(figsize=(14, 9))
            plt.style.context('dark_background')

            plt.title(item_name)
            # plt.plot(day,iffted_abnormal_search,price_difference)
            # plt.plot(day,ratio)
            # plt.plot(day,product)
            print(len(day), len(iffted_abnormal_search), len(price_difference))

            plt.plot(day, extrapolation, 'b', label='pattern')
            plt.plot(day, iffted_abnormal_search, 'r', price_difference, 'g')
            red_patch = mpatches.Patch(color='red', label='경향성 예측')
            blue_patch = mpatches.Patch(color='blue', label='패턴 예측')
            green_patch = mpatches.Patch(color='green', label='실 주가 변동량')
            plt.legend(handles=[red_patch, blue_patch, green_patch])
            # plt.plot(abnormal_search)
            plt.xlabel('날짜')
            plt.ylabel('주가 변동량')


        except IndexError:
            print("IndexError in", item_name)


    webgraph = [['Day', '실주가', '예측주가']]
    for i in range(0, len(day)):  # hmm i     ahh j      Hmm l
        for j in range(0, len(day[i])):
            uhh = list(day[i])
            for l in range(0, len(uhh)):
                if uhh[l] == "\n":
                    uhh[l] = '/'
            day[i] = ''.join(uhh)
    for i in range(0, len(iffted_abnormal_search)):
        iffted_abnormal_search[i] = iffted_abnormal_search[i].real
    for i in range(0, len(day)):
        webgraph.append([day[i], stock_price[i], iffted_abnormal_search[i]])
    return redirect(url_for('success', graph = webgraph))

if __name__ == '__main__':
    app.run(debug=True)